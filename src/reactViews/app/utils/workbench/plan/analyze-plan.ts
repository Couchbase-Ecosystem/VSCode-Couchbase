/* eslint-disable no-param-reassign */
import { Lists, Plan } from 'types/plan';
import { convertTimeFloatToFormattedString, convertTimeStringToFloat, getFieldsFromExpressionWithParser } from './analyze-plan.util';
import n1ql from './n1ql';

export const analyzePlan = (plan: Plan | null | string, lists: Lists | null): Lists | null => {
  if (!lists)
    lists = {
      buckets: {},
      fields: {},
      indexes: {},
      aliases: [],
      total_time: 0.0,
      warnings: [],
    };

  if (!plan || typeof plan === 'string') {
    return null;
  }
  // special case: prepared queries are marked by an "operator" field
  if (plan.operator) {
    return analyzePlan(plan.operator, null);
  }
  // special case #2: plan with query timings is wrapped in an outer object
  if (plan.plan && !plan['#operator']) {
    return analyzePlan(plan.plan, null);
  }

  // iterate over fields, look for "#operator" field
  const operatorName = plan['#operator'];

  // some operators might have a warning status. Right now that is only
  // the NestedLoopJoin, which has "hint_not_followed"
  if (plan.hint_not_followed) lists.warnings!.push(`Hint not followed: ${plan.hint_not_followed}`);

  // at this point we should have an operation name and a field array
  // we had better have an operator name at this point
  if (!operatorName) {
    return lists;
  }

  // if the operator has timing information, convert to readable and analyzable forms:
  if (plan['#time'] || (plan['#stats'] && (plan['#stats'].execTime || plan['#stats'].servTime))) {
    let parsedValue = 0.0;
    if (plan['#time']) {
      parsedValue = convertTimeStringToFloat(plan['#time']);
    } else if (plan['#stats']) {
      if (plan['#stats'].execTime) parsedValue += convertTimeStringToFloat(plan['#stats'].execTime);
      if (plan['#stats'].servTime) parsedValue += convertTimeStringToFloat(plan['#stats'].servTime);
    }

    plan['#time_normal'] = convertTimeFloatToFormattedString(parsedValue);
    plan['#time_absolute'] = parsedValue;
    if (!lists.total_time) {
      lists.total_time = 0;
    }

    lists.total_time += parsedValue;
  }

  // if we have a sequence, we analyze the children in order
  if (operatorName === 'Sequence' && plan['~children']) {
    // a sequence may have aliases that rename buckets, but those aliases become invalid after
    // the sequence. Remember how long the sequence was at the beginning.
    const initialAliasLen = lists.aliases.length;

    for (let i = 0; i < plan['~children'].length; i++) {
      // if we see a fetch, remember the keyspace for subsequent projects
      if (plan['~children'][i]['#operator'] === 'Fetch') lists.currentKeyspace = plan['~children'][i].keyspace;
      analyzePlan(plan['~children'][i], lists);
    }

    // remove any new aliases
    lists.aliases.length = initialAliasLen;
    return lists;
  }

  // parallel groups are like sequences, but with only one child
  if (operatorName === 'Parallel' && plan['~child']) {
    analyzePlan(plan['~child'], lists);
    return lists;
  }

  // Prepare operators have their plan inside prepared.operator
  if (operatorName === 'Prepare' && plan.prepared && plan.prepared.operator) {
    analyzePlan(plan.prepared.operator, lists);
    return lists;
  }

  // ExceptAll and IntersectAll have 'first' and 'second' subqueries
  if (operatorName === 'ExceptAll' || operatorName === 'IntersectAll') {
    if (plan.first) analyzePlan(plan.first, lists);
    if (plan.second) analyzePlan(plan.second, lists);
    return lists;
  }

  // Merge has two children: 'delete' and 'update'
  if (operatorName === 'Merge') {
    if (plan.as) lists.aliases.push({ keyspace: plan.keyspace!, as: plan.as });
    if (plan.delete) analyzePlan(plan.delete, lists);
    if (plan.update) analyzePlan(plan.update, lists);
    if (plan.keyspace) getFieldsFromExpressionWithParser(plan.keyspace, lists);
    if (plan.key) getFieldsFromExpressionWithParser(plan.key, lists);
    return lists;
  }

  // Authorize operators have a single child called '~child'
  if (operatorName === 'Authorize' && plan['~child']) {
    analyzePlan(plan['~child'], lists);
    return lists;
  }

  // DistinctScan operators have a single child called 'scan'
  if (operatorName === 'DistinctScan' && plan.scan) {
    analyzePlan(plan.scan, lists);
    return lists;
  }

  // Similar to UNIONs, IntersectScan, UnionScan group a number of different scans
  // have an array of 'scan' that are merged together
  if (operatorName === 'UnionScan' || operatorName === 'IntersectScan' || operatorName === 'OrderedIntersectScan') {
    for (let i = 0; i < plan.scans!.length; i++) analyzePlan(plan.scans![i], lists);
    return lists;
  }

  // UNION operators will have an array of predecessors drawn from their "children".
  // we expect predecessor to be null if we see a UNION
  if ((operatorName === 'Union' || operatorName === 'UnionAll') && plan['~children']) {
    for (let i = 0; i < plan['~children'].length; i++) analyzePlan(plan['~children'][i], lists);

    return lists;
  }

  // The Order operator has an array of expressions
  if (operatorName === 'Order')
    for (let i = 0; i < plan.sort_terms!.length; i++) {
      getFieldsFromExpressionWithParser(plan.sort_terms![i].expr, lists);
    }
  // the CreateIndex operator has keys, which are expressions we need to parse
  else if (operatorName === 'CreateIndex') {
    if (plan.keys && plan.keys.length)
      // CreateIndex keys are un-parsed N1QL expressions, we need to parse
      for (let i = 0; i < plan.keys.length; i++) {
        const parseTree = n1ql.parse(plan.keys[i].expr);

        // parse tree has array of array of strings, we will build
        if (parseTree && plan.keyspace)
          for (let p = 0; p < parseTree.length; p++) {
            for (let j = 0; j < parseTree[p].pathsUsed.length; j++) {
              if (parseTree[p].pathsUsed[j]) {
                let field = plan.keyspace;
                for (let k = 0; k < parseTree[p].pathsUsed[j].length; k++) {
                  field += `.${parseTree[p].pathsUsed[j][k]}`;
                }

                lists.fields[field] = true;
              }
            }
          }
      }
  }

  // for all other operators, certain fields will tell us stuff:
  //  - keyspace is a bucket name
  //  - index is an index name
  //  - condition is a string containing an expression, fields there are of the form (`keyspace`.`field`)
  //  - expr is the same as condition
  //  - on_keys is an expression
  //  - limit is an expression
  //  - group_keys is an array of fields

  if (plan.keyspace) lists.buckets[plan.keyspace] = true;
  if (plan.index && plan.keyspace) lists.indexes![`${plan.keyspace}.${plan.index}`] = true;
  else if (plan.index) lists.indexes![plan.index] = true;
  if (plan.group_keys) for (let i = 0; i < plan.group_keys.length; i++) lists.fields[plan.group_keys[i]] = true;
  if (plan.condition) getFieldsFromExpressionWithParser(plan.condition, lists);
  if (plan.expr) getFieldsFromExpressionWithParser(plan.expr, lists);
  if (plan.on_keys) getFieldsFromExpressionWithParser(plan.on_keys, lists);
  if (plan.limit) getFieldsFromExpressionWithParser(plan.limit, lists);

  if (plan.as && plan.keyspace) {
    lists.aliases.push({ keyspace: plan.keyspace, as: plan.as });
  }
  if (plan.result_terms && Array.isArray(plan.result_terms))
    for (let i = 0; i < plan.result_terms.length; i++)
      if (plan.result_terms[i].expr)
        if (plan.result_terms[i].expr === 'self' && plan.result_terms[i].star && lists.currentKeyspace)
          lists.fields[`${lists.currentKeyspace}.*`] = true;
        else {
          getFieldsFromExpressionWithParser(plan.result_terms[i].expr, lists);
        }

  return lists;
};
