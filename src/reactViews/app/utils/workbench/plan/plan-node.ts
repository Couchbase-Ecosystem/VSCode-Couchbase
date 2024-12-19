import { Plan } from 'types/plan';

export const makePlanNode = (
  predecessor: Plan['predecessor'],
  operator: Plan,
  subsequence: Plan['subsequence'],
  total_query_time: number
): Plan => {
  return {
    predecessor, // might be an array if this is a Union node
    operator, // object from the actual plan
    subsequence, // for parallel ops, arrays of plan nodes done in parallel
    time_percent:
      total_query_time && operator['#time_absolute'] ? Math.round((operator['#time_absolute'] * 1000) / total_query_time) / 10 : undefined,
  };
};

export const getBranchCount = (node: Plan) => {
  if (node.predecessor === null) {
    return 1;
  }
  // our width is the max of the predecessor and the subsequence widths
  let predWidth = 0;
  let subsequenceWidth = 0;

  if (!Array.isArray(node.predecessor)) {
    predWidth = node.predecessor!.BranchCount!();
  } else {
    for (let i = 0; i < node.predecessor.length; i++) {
      predWidth += node.predecessor[i].BranchCount!();
    }
  }

  if (node.subsequence != null) {
    subsequenceWidth = node.subsequence.BranchCount!();
  }

  return subsequenceWidth > predWidth ? subsequenceWidth : predWidth;
};

export const getDepth = (node: Plan) => {
  const ourDepth = node.subsequence ? node.subsequence?.Depth!() : 1;

  if (node.predecessor == null) {
    return ourDepth;
  }
  if (!Array.isArray(node.predecessor)) {
    return ourDepth + node.predecessor.Depth!();
  }
  let maxPredDepth = 0;
  for (let i = 0; i < node.predecessor.length; i++) {
    if (node.predecessor[i].Depth!() > maxPredDepth) {
      maxPredDepth = node.predecessor[i].Depth!();
    }
  }

  return maxPredDepth + 1;
};

/**
 * for now, the only unambiguously expensive operations are:
 *  - PrimaryScan
 * - IntersectScan
 * we want to add correlated subqueries, but info on those in not yet
 * in the query plan. Other ops may be added in future.
 */
export const getCostLevel = (node: Plan) => {
  const op = node.operator;
  if (!op || !op['#operator']) return 0;

  switch (op['#operator']) {
    case 'PrimaryScan':
    case 'IntersectScan':
      return 2;
    default:
      return 0;
  }
};
