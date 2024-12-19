import { HierarchyNode } from 'd3-hierarchy';
import { ExecutionPlanNode } from 'types/plan';
import { PlanConfig } from './config';

export const getHeight = (node: HierarchyNode<ExecutionPlanNode>, lineHeight: number, compact: boolean): number => {
  if (compact) {
    return PlanConfig.compactSize;
  }
  let numLines = 2;
  if (node && node.data && node.data.details) numLines += node.data.details.length;
  return lineHeight * numLines;
};
