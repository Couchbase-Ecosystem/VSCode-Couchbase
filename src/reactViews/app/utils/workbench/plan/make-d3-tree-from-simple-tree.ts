/* eslint-disable no-param-reassign */
import { hierarchy, HierarchyNode, HierarchyPointNode, tree } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { ExecutionPlanNode, Orientation, PlanOptions } from 'types/plan';
import { getHeight } from './get-height';
import { getLink } from './get-link';
import { getNodeTranslation } from './get-node-translation';
import { getRootTranslation } from './get-root-translation';
import { getWidth } from './get-width';
import { handleZoom } from './handle-zoom';
import { makeTooltip } from './make-tooltip';
import { removeAllToolTips } from './remove-all-tooltips';

const minNodeWidthVert = 155;
const minNodeWidth = 225;

export const makeD3TreeFromSimpleTree = (root: ExecutionPlanNode, ele: HTMLDivElement, options: PlanOptions) => {
  if (!ele) {
    return null;
  }
  const { lineHeight, orientation } = options;
  const duration = 500;
  let i = 0;
  const vert = orientation === Orientation.TopToBottom || orientation === Orientation.BottomToTop;

  const canvasWidth = ele.clientWidth;
  const canvasHeight = ele.clientHeight;

  const svg: any = select(ele)
    .append('svg:svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('overflow', 'scroll')
    .on('click', removeAllToolTips(ele))
    .append('svg:g')
    .attr('class', 'drawarea')
    .attr('id', 'svg_g');

  const trans = svg.transition().duration(duration);

  // need a definition for arrows on lines
  const arrowheadRefX = vert ? 0 : 0;
  const arrowheadRefY = vert ? 2 : 2;

  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 0 10 12')
    .attr('refX', arrowheadRefX) /* must be smarter way to calculate shift */
    .attr('refY', arrowheadRefY)
    .attr('markerWidth', 20)
    .attr('markerHeight', 20)
    .attr('orient', 'auto')
    .attr('class', 'wb-marker')
    .append('path')
    .attr('d', 'M 6 0 V 4 L 0 2 Z'); // this is actual shape for arrowhead

  const minNodeSize: [number, number] = vert ? [minNodeWidthVert, lineHeight * 7] : [lineHeight * 6, minNodeWidth];

  const d3Root: unknown = hierarchy(root);
  const typedD3Root = d3Root as HierarchyPointNode<ExecutionPlanNode> & { x0: number; y0: number };
  tree().nodeSize(minNodeSize)(typedD3Root);
  // use nice curves between the nodes
  const diagonal = getLink(options);

  // assign nodes and links
  const nodes = typedD3Root.descendants();
  const links = typedD3Root.links();

  // we want to pan/zoom so that the whole graph is visible.
  // for some reason I can't get getBBox() to give me the bounding box for the overall
  // graph, so instead I'll just check the coords of all the nodes to get a bounding box

  let minX = canvasWidth;
  let maxX = 0;
  let minY = canvasHeight;
  let maxY = 0;
  nodes.forEach((d: HierarchyPointNode<ExecutionPlanNode>) => {
    minX = Math.min(d.x, minX);
    minY = Math.min(d.y, minY);
    maxX = Math.max(d.x, maxX);
    maxY = Math.max(d.y, maxY);
  });

  // to make a horizontal tree, x and y are swapped
  const dx = vert ? maxX - minX : maxY - minY;
  const dy = !vert ? maxX - minX : maxY - minY;
  let x = vert ? (minX + maxX) / 2 : (minY + maxY) / 2;
  let y = !vert ? (minX + maxX) / 2 : (minY + maxY) / 2;

  // if flipped, we need to flip the bounding box
  if (orientation === Orientation.BottomToTop) y = -y;
  else if (orientation === Orientation.RightToLeft) x = -x;

  const scale = Math.max(0.15, Math.min(2, 0.85 / Math.max(dx / canvasWidth, dy / canvasHeight)));

  const midX = canvasWidth / 2 - scale * x;
  const midY = canvasHeight / 2 - scale * y;

  // set up zooming
  const zoomer = zoom().scaleExtent([0.1, 2.5]).on('zoom', handleZoom(svg));
  select(ele).call(zoomer as any);

  // set up the initial location of the graph, so it's centered on the screen
  (select(ele) as any).transition().call(zoomer.transform, zoomIdentity.translate(midX, midY).scale(scale));

  // Each node needs a unique id. If id field doesn't exist, use incrementing value
  const node = svg.selectAll('g.node').data(nodes, (d: any) => d.id || ++i);

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .append('svg:g')
    .attr('class', 'wb-explain-node')
    .attr('transform', getRootTranslation(orientation))
    .on('click', makeTooltip(ele));

  // *** node drop-shadows come from this filter ******************
  // filters go in defs element
  const defs = svg.append('defs');

  // create filter with id #drop-shadow
  // height=130% so that the shadow is not clipped
  const filter = defs.append('filter').attr('id', 'drop-shadow').attr('height', '130%');

  // SourceAlpha refers to opacity of graphic that this filter will be applied to
  // convolve that with a Gaussian with standard deviation 1 and store result
  // in blur
  filter.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', 1).attr('result', 'blur');

  // translate output of Gaussian blur downwards with 1px
  // store result in offsetBlur
  filter.append('feOffset').attr('in', 'blur').attr('dx', 0).attr('dy', 1).attr('result', 'offsetBlur');

  // overlay original SourceGraphic over translated blurred opacity by using
  // feMerge filter. Order of specifying inputs is important!
  const feMerge = filter.append('feMerge');

  feMerge.append('feMergeNode').attr('in', 'offsetBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  // ********* create node style from data *******************
  nodeEnter
    .append('rect')
    .attr('width', (d: HierarchyNode<ExecutionPlanNode>) => getWidth(d, options.compact))
    .attr('height', (d: HierarchyNode<ExecutionPlanNode>) => getHeight(d, lineHeight, options.compact))
    .attr('rx', lineHeight) // sets corner roundness
    .attr('ry', lineHeight)
    .attr('x', (d: HierarchyNode<ExecutionPlanNode>) => (-1 / 2) * getWidth(d, options.compact)) // make the rect centered on our x/y coords
    .attr('y', (d: HierarchyNode<ExecutionPlanNode>) => (getHeight(d, lineHeight, options.compact) * -1) / 2)
    .attr('class', (d: HierarchyNode<ExecutionPlanNode>) => d.data.level)
    // drop-shadow filter
    .style('filter', 'url(#drop-shadow)');

  if (!options.compact) {
    nodeEnter
      .append('text')
      .attr('dy', (d: HierarchyNode<ExecutionPlanNode>) => (getHeight(d, lineHeight, options.compact) * -1) / 2 + lineHeight) // m
      .attr('class', 'wb-explain-node-text')
      .text((d: HierarchyNode<ExecutionPlanNode>) => d.data.name);
  }

  const calcHeight = (_l: number, i: number) => (d: HierarchyNode<ExecutionPlanNode>) => {
    return (getHeight(d, lineHeight, options.compact) * -1) / 2 + lineHeight * (i + 2);
  };

  if (!options.compact) {
    const getText = (i: number) => (d: HierarchyNode<ExecutionPlanNode>) => d.data.details[i];

    // handle up to 4 lines of details
    for (let i = 0; i < 4; i++)
      nodeEnter.append('text').attr('dy', calcHeight(lineHeight, i)).attr('class', 'wb-explain-node-text-details').text(getText(i));
  }
  // Transition nodes to their new position.
  nodeEnter.transition(trans).attr('transform', getNodeTranslation(orientation));

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node
    .exit()
    .transition(trans)
    .attr('transform', () => {
      return `translate(${typedD3Root.y},${typedD3Root.x})`;
    })
    .remove();

  nodeExit.select('rect').attr('r', 1e-6);

  // Update the links
  const link = svg.selectAll('path.link').data(links, (d: any) => d.target.id);

  // Enter any new links at the parent's previous position.
  link
    .enter()
    .insert('path', 'g')
    .attr('class', (l: any) => {
      if (l.target.cloneOf && l.source.cloneOf) {
        return 'wb-clone-link';
      }
      return 'wb-explain-link';
    })
    .attr('marker-start', 'url(#arrowhead)')
    .attr('d', () => {
      const o = { x: typedD3Root.x0, y: typedD3Root.y0 };
      // eslint-disable-next-line
      // @ts-ignore
      const p = diagonal({ source: o, target: o });
      return p;
    })
    // Transition links to their new position.
    .transition(trans)
    .attr('d', diagonal);

  // Transition exiting nodes to the parent's new position.
  link
    .exit()
    .transition(trans)
    .attr('d', () => {
      const o = { x: typedD3Root.x, y: typedD3Root.y };
      // eslint-disable-next-line
      // @ts-ignore
      return diagonal({ root: o, target: o });
    })
    .remove();

  // Stash the old positions for transition.
  nodes.forEach((d: HierarchyPointNode<ExecutionPlanNode> & { x0: number; y0: number }) => {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  return zoomer;
};
