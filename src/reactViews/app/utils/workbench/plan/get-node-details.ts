import { Plan } from 'types/plan';

const MAX_LENGTH = 35;

const truncate = (length: number, item: string) => {
  if (typeof item !== 'string') {
    return item;
  }

  if (item.length > length) {
    return `${item.slice(0, length)}...`;
  }
  return item;
};

const concatTruncated = (array: string[], item: string) => {
  array.push(truncate(MAX_LENGTH, item));
  return array;
};

export const getNodeDetails = (plan: Plan): string[] => {
  const result: string[] = [];
  const { operator } = plan;

  if (!operator || !operator['#operator']) return result;

  // eslint-disable-next-line default-case
  switch (operator['#operator']) {
    case 'IndexScan': // for index scans, show the keyspace
      concatTruncated(result, `by: ${operator.keyspace}.${operator.index}`);
      break;

    case 'IndexScan2':
    case 'IndexScan3':
      concatTruncated(result, `${operator.keyspace}.${operator.index}`);
      if (operator.as) concatTruncated(result, `as: ${operator.as}`);
      break;

    case 'PrimaryScan': // for primary scan, show the index name
      concatTruncated(result, operator.keyspace!);
      break;

    case 'InitialProject':
      concatTruncated(result, `${operator.result_terms!.length} terms`);
      break;

    case 'Fetch':
      concatTruncated(result, operator.keyspace + (operator.as ? ` as ${operator.as}` : ''));
      break;

    case 'Alias':
      concatTruncated(result, operator.as!);
      break;

    case 'NestedLoopJoin':
    case 'NestedLoopNest':
    case 'HashJoin':
    case 'HashNest':
      concatTruncated(result, `on: ${operator.on_clause!}`);
      break;

    case 'Limit':
    case 'Offset':
      concatTruncated(result, operator.expr!);
      break;

    case 'Join':
      concatTruncated(result, `${operator.keyspace + (operator.as ? ` as ${operator.as}` : '')} on ${operator.on_keys}`);
      break;

    case 'Order':
      if (operator.sort_terms)
        for (let i = 0; i < operator.sort_terms.length; i++) {
          concatTruncated(result, operator.sort_terms[i].expr);
        }
      break;

    case 'InitialGroup':
    case 'IntermediateGroup':
    case 'FinalGroup':
      if (operator.aggregates && operator.aggregates.length > 0) {
        let aggr = 'Aggrs: ';
        for (let i = 0; i < operator.aggregates.length; i++) aggr += operator.aggregates[i];
        concatTruncated(result, aggr);
      }

      if (operator.group_keys && operator.group_keys.length > 0) {
        let keys = 'By: ';
        for (let i = 0; i < operator.group_keys.length; i++) keys += operator.group_keys[i];
        concatTruncated(result, keys);
      }
      break;

    case 'Filter':
      if (operator.condition) concatTruncated(result, operator.condition);
      break;
    case 'default':
      break;
  }

  // if there's a limit on the operator, add it here
  if (operator.limit && operator.limit.length) concatTruncated(result, operator.limit);

  // if we get operator timings, put them at the end of the details
  if (operator['#time_normal']) {
    concatTruncated(result, operator['#time_normal'] + (plan.time_percent && plan.time_percent > 0 ? ` (${plan.time_percent}%)` : ''));
  }

  if (operator['#stats']) {
    let inStr = '';
    let outStr = '';

    // itemsIn is a number
    if (operator['#stats']['#itemsIn'] || operator['#stats']['#itemsIn'] === 0) inStr = operator['#stats']['#itemsIn'].toString();
    if (operator['#stats']['#itemsOut'] || operator['#stats']['#itemsOut'] === 0) outStr = operator['#stats']['#itemsOut'].toString();

    // if we have both inStr and outStr, put a slash between them
    const inOutStr =
      (inStr.length > 0 ? `${inStr} in` : '') +
      (inStr.length > 0 && outStr.length > 0 ? ' / ' : '') +
      (outStr.length > 0 ? `${outStr} out` : '');

    if (inOutStr.length > 0) concatTruncated(result, inOutStr);
  }
  // handle Analytics operators
  if (operator.variables) concatTruncated(result, `vars: ${operator.variables}`);
  if (operator.expressions) concatTruncated(result, `expr:${operator.expressions}`);

  return result;
};
