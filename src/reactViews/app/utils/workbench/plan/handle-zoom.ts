import { BaseType, event, Selection } from 'd3-selection';

export const handleZoom = (svg: Selection<BaseType, unknown, null, undefined>) => () => {
  svg.attr('transform', event.transform);
};
