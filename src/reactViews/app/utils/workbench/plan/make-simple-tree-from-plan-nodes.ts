/* eslint-disable no-param-reassign */
import { ExecutionPlanNode, Plan } from 'types/plan';
import { getNodeDetails } from './get-node-details';
import { getNodeName } from './get-node-name';
import { getToolTip } from './get-tool-tip';

export const makeSimpleTreeFromPlanNodes = (
  plan: Plan,
  next: Plan['predecessor'] | null,
  parent: string | null,
  nodeCache?: { [key: string]: ExecutionPlanNode }
): ExecutionPlanNode | null => {
  // keep a cache of nodes we have created, in case we see them again
  if (!nodeCache) nodeCache = {};

  if (!plan) {
    return null;
  }

  // we ignore operators of nodes with subsequences, and put in the subsequence
  if (plan.subsequence) return makeSimpleTreeFromPlanNodes(plan.subsequence, plan.predecessor, parent, nodeCache);

  if (!plan.operator) return null;

  const details = getNodeDetails(plan);
  const result: ExecutionPlanNode = {
    name: getNodeName(plan),
    details,
    parent,
    level: 'node', // default background color
    time: plan.time,
    time_percent: plan.time_percent,
    tooltip: getToolTip(plan),
    cloneOf: null,
    children: [] as ExecutionPlanNode[],
  };

  // how expensive are we? Color background by cost, if we know
  if (plan && plan.time_percent) {
    if (plan.time_percent >= 20) result.level = 'wb-explain-node-expensive-1';
    else if (plan.time_percent >= 5) result.level = 'wb-explain-node-expensive-2';
    else if (plan.time_percent >= 1) result.level = 'wb-explain-node-expensive-3';
  }

  // if we have seen a node with this id before, we need to mark the new node as a clone
  // the clone will then override the layout to move to it's twin's location
  // this is because D3 doesn't support DAGs, so we will fake it with a tree with co-located nodes

  if (plan && plan.operator && plan.operator.operatorId && nodeCache[plan.operator.operatorId])
    result.cloneOf = nodeCache[plan.operator.operatorId];
  // otherwise add this new node to the cache
  // eslint-disable-next-line no-param-reassign
  else if (plan.operator.operatorId) nodeCache[plan.operator.operatorId] = result;

  // if the plan has a 'predecessor', it is either a single plan node that should be
  // our child, or an array marking multiple children

  if (plan.predecessor) {
    result.children = [];
    if (!Array.isArray(plan.predecessor)) {
      result.children.push(makeSimpleTreeFromPlanNodes(plan.predecessor, next, result.name, nodeCache)!);
    } else
      for (let i = 0; i < plan.predecessor.length; i++) {
        result.children.push(makeSimpleTreeFromPlanNodes(plan.predecessor[i], null, result.name, nodeCache)!);
      }
  }

  return result;
};
