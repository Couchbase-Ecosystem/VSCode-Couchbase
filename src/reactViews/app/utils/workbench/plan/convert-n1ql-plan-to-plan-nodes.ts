import { Lists, Plan } from 'types/plan';
import { makePlanNode } from './plan-node';

export const convertN1QLPlanToPlanNodes = (plan: Plan, predecessor: Plan | null, lists: Lists | null): Plan | null => {
  if (!plan || typeof plan === 'string') return null;

  // special case: prepared queries
  if (plan.operator) return convertN1QLPlanToPlanNodes(plan.operator, null, lists);

  // special case #2: plan with query timings is wrapped in an outer object
  if (plan.plan && !plan['#operator']) return convertN1QLPlanToPlanNodes(plan.plan, null, lists);

  // iterate over fields, look for "#operator" field
  const operatorName = plan['#operator'];

  // at this point we should have an operation name and a field array
  // we had better have an operator name at this point
  if (!operatorName) {
    return null;
  }

  // if we have a sequence, we analyze the children and append them to the predecessor
  if (operatorName === 'Sequence' && plan['~children']) {
    let predecessorClone = { ...predecessor };
    for (let i = 0; i < plan['~children'].length; i++) {
      predecessorClone = convertN1QLPlanToPlanNodes(plan['~children'][i], predecessorClone, lists)!;
    }
    return predecessorClone;
  }

  // parallel groups are like sequences. We used to wrap them in a separate Node, but
  // that is not really needed, we will just mark the beginning and end.
  if (operatorName === 'Parallel' && plan['~child']) {
    const subsequence = convertN1QLPlanToPlanNodes(plan['~child'], predecessor, lists);
    // mark the elements of a parallel subsequence for later annotation
    for (let subNode = subsequence; subNode != null; subNode = (subNode.predecessor as Plan) ?? null) {
      if (subNode === subsequence) subNode.parallelBegin = true;
      if (subNode.predecessor === predecessor) {
        subNode.parallelEnd = true;
      }
      subNode.parallel = true;
    }
    return subsequence;
  }

  // Prepare operators have their plan inside prepared.operator
  if (operatorName === 'Prepare' && plan.prepared && plan.prepared.operator) {
    return convertN1QLPlanToPlanNodes(plan.prepared.operator, null, lists);
  }

  // ExceptAll and InterceptAll have 'first' and 'second' subqueries
  if (operatorName === 'ExceptAll' || operatorName === 'IntersectAll') {
    const children = [];

    if (plan.first) children.push(convertN1QLPlanToPlanNodes(plan.first, null, lists)!);

    if (plan.second) children.push(convertN1QLPlanToPlanNodes(plan.second, null, lists)!);

    if (children.length > 0) {
      return makePlanNode(children, plan, null, lists?.total_time ?? 0);
    }
    return null;
  }

  // Merge may have various children: 'insert', 'delete' and/or 'update'
  if (operatorName === 'Merge') {
    const children = [];

    if (predecessor) children.push(predecessor);

    if (plan.insert) children.push(convertN1QLPlanToPlanNodes(plan.insert, null, lists)!);

    if (plan.delete) children.push(convertN1QLPlanToPlanNodes(plan.delete, null, lists)!);

    if (plan.update) children.push(convertN1QLPlanToPlanNodes(plan.update, null, lists)!);

    if (children.length > 0) return makePlanNode(children, plan, null, lists?.total_time ?? 0);
    return null;
  }

  // Authorize operators have a single child called '~child', the child comes *after*
  // the authorize op
  if (operatorName === 'Authorize' && plan['~child']) {
    const authorizeNode = makePlanNode(predecessor!, plan, null, lists?.total_time ?? 0);
    const authorizeChildren = convertN1QLPlanToPlanNodes(plan['~child'], authorizeNode, lists);
    return authorizeChildren;
  }

  // DistinctScan operators have a single child called 'scan'
  if (operatorName === 'DistinctScan' && plan.scan) {
    return makePlanNode(convertN1QLPlanToPlanNodes(plan.scan, null, lists)!, plan, null, lists?.total_time ?? 0);
  }

  // UNION operators will have an array of predecessors drawn from their "children".
  // we expect predecessor to be null if we see a UNION
  if (operatorName === 'UnionAll' && plan['~children']) {
    const unionChildren = [];

    // if there is a predecessor, it's probably an authorize node done before everything.
    // what to do? for now put it on every child of the Union
    for (let i = 0; i < plan['~children'].length; i++)
      unionChildren.push(convertN1QLPlanToPlanNodes(plan['~children'][i], predecessor, lists)!);

    const unionNode = makePlanNode(unionChildren, plan, null, lists?.total_time ?? 0);
    return unionNode;
  }

  // NestedLoopJoin and NestedLoopNest operators have the INNER part of the join represented
  // by a ~child field which is a sequence of operators. The OUTER is the inputs to the
  // NestedJoin op, which are already captured
  if (
    (operatorName === 'NestedLoopJoin' ||
      operatorName === 'NestedLoopNest' ||
      operatorName === 'HashJoin' ||
      operatorName === 'HashNest' ||
      operatorName === 'Join' ||
      operatorName === 'Nest') &&
    plan['~child']
  ) {
    const inner = predecessor!;
    const outer = convertN1QLPlanToPlanNodes(plan['~child'], null, lists)!;
    return makePlanNode([inner, outer], plan, null, lists?.total_time ?? 0);
  }

  // Similar to UNIONs, IntersectScan, UnionScan group a number of different scans
  // have an array of 'scan' that are merged together
  if (operatorName === 'UnionScan' || operatorName === 'IntersectScan') {
    const scanChildren = [];

    for (let i = 0; i < plan.scans!.length; i++) {
      scanChildren.push(convertN1QLPlanToPlanNodes(plan.scans![i], null, lists)!);
    }

    return makePlanNode(scanChildren, plan, null, lists?.total_time ?? 0);
  }

  // ignore FinalProject, IntermediateGroup, and FinalGRoup, which don't add anything
  if (operatorName === 'FinalProject' || operatorName === 'IntermediateGroup' || operatorName === 'FinalGroup') {
    return predecessor;
  }

  // WITH operator has bindings, and a child
  if (operatorName === 'With') {
    const withNode = makePlanNode(predecessor!, plan, null, lists?.total_time ?? 0);
    const withChildren = convertN1QLPlanToPlanNodes(plan['~child']!, withNode, lists);
    return withChildren;
  }

  // for all other operators, create a plan node
  return makePlanNode(predecessor!, plan, null, lists?.total_time ?? 0);
};
