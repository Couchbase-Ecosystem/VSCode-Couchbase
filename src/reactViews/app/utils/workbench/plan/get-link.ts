import { HierarchyPointNode } from 'd3-hierarchy';
import { linkHorizontal, linkVertical } from 'd3-shape';
import { ExecutionPlanNode, Orientation, PlanOptions } from 'types/plan';
import { getHeight } from './get-height';
import { getWidth } from './get-width';

export const getLink = ({ orientation, lineHeight, compact }: PlanOptions) => {
  switch (orientation) {
    case Orientation.TopToBottom:
      return linkVertical()
        .x((node: unknown) => {
          const typedNode = node as HierarchyPointNode<ExecutionPlanNode>;
          return typedNode.x;
        })
        .y((node: unknown) => {
          const typedNode = node as HierarchyPointNode<ExecutionPlanNode>;
          return typedNode.y + getHeight(typedNode, lineHeight, compact) / 2;
        });
    case Orientation.BottomToTop:
      return linkVertical()
        .x((node: unknown) => {
          const typedNode = node as HierarchyPointNode<ExecutionPlanNode>;
          return typedNode.x;
        })
        .y((node: unknown) => {
          const typedNode = node as HierarchyPointNode<ExecutionPlanNode>;
          return -typedNode.y - getHeight(typedNode, lineHeight, compact) / 2;
        });
    case Orientation.LeftToRight:
      return linkHorizontal()
        .x((node: unknown) => {
          const typedNode = node as HierarchyPointNode<ExecutionPlanNode>;
          return typedNode.y + getWidth(typedNode, compact) / 2;
        })
        .y((node: unknown) => {
          const typedNode = node as HierarchyPointNode<ExecutionPlanNode>;
          return typedNode.x;
        });
    case Orientation.RightToLeft:
    default:
      return linkHorizontal()
        .x((node: unknown) => {
          const typedNode = node as HierarchyPointNode<ExecutionPlanNode>;
          return -typedNode.y - getWidth(typedNode, compact) / 2;
        })
        .y((node: unknown) => {
          const typedNode = node as HierarchyPointNode<ExecutionPlanNode>;
          return typedNode.x;
        });
  }
};
