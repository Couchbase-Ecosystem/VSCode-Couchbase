import { HierarchyPointNode } from 'd3-hierarchy';
import { ExecutionPlanNode, Orientation } from 'types/plan';

type RequiredNode = {
  x: HierarchyPointNode<ExecutionPlanNode>['x'];
  y: HierarchyPointNode<ExecutionPlanNode>['y'];
  data: {
    cloneOf?: RequiredNode;
  };
};

export const getNodeTranslation =
  (orientation: Orientation) =>
  (node: RequiredNode): string => {
    // if the node is a clone, get the translation from the source
    if (node.data.cloneOf) return getNodeTranslation(orientation)(node.data.cloneOf);

    // otherwise base it on the orientation of the graph
    switch (orientation) {
      case Orientation.TopToBottom:
        return `translate(${node.x},${node.y})`;

      case Orientation.BottomToTop:
        return `translate(${node.x},${-node.y})`;

      case Orientation.LeftToRight:
        return `translate(${node.y},${node.x})`;

      case Orientation.RightToLeft:
      default:
        return `translate(${-node.y},${node.x})`;
    }
  };
