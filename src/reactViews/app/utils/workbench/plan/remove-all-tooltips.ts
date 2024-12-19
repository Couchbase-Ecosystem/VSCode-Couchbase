import { select } from 'd3-selection';

export const removeAllToolTips = (node: HTMLElement) => () => {
  select(node).selectAll('.wb-explain-tooltip').remove();
};
