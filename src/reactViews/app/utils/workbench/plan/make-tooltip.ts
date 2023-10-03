import { HierarchyNode } from 'd3-hierarchy';
import { event, select, Selection } from 'd3-selection';
import { ExecutionPlanNode } from 'types/plan';
import { removeAllToolTips } from './remove-all-tooltips';

export const makeTooltip = (node: HTMLElement) => (d: HierarchyNode<ExecutionPlanNode>) => {
  removeAllToolTips(node)();
  const toolTipDiv: Selection<HTMLDivElement, unknown, null, undefined> = select(node)
    .append('div')
    .attr('id', `svg_tooltip${d.id}`)
    .attr('class', 'wb-explain-tooltip')
    .on('click', () => {
      return toolTipDiv.style('display', 'none');
    });

  if (d.data.tooltip && d.data.tooltip.length > 0) {
    // @ts-ignore as transition is not defined in toolTipDiv
    toolTipDiv.transition().duration(300).style('display', 'block');
    const HEADER_DIV = toolTipDiv.append('div');
    HEADER_DIV.html('<a class="ui-dialog-titlebar-close modal-close" onclick="console.log("click")"> X </a>');
    toolTipDiv
      .html(d.data.tooltip)
      .style('z-index', '30')
      .style('left', `${event.x}px`)
      .style('bottom', `${window.innerHeight - event.y}px`);
  }

  event.stopPropagation();
};
