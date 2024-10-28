import { useEffect, useRef } from 'react';
import { NodeScore } from '@/api/data/inference';
import { useMeasure, useThrottle } from '@uidotdev/usehooks';
import * as d3 from 'd3';

const colors = [
  '#B34962',
  '#5EC353',
  '#9957CA',
  '#9CB835',
  '#5B6FD9',
  '#409538',
  '#D561C5',
  '#69882B',
  '#D5448E',
  '#5DC08A',
  '#D33B55',
  '#40C0BC',
  '#C64221',
  '#48A8D7',
  '#DE882F',
  '#6D8ED3',
  '#CBAA3E',
  '#6C60A6',
  '#A1B56D',
  '#9F4D8F',
  '#408147',
  '#CF90D0',
  '#626A2A',
  '#E2828C',
  '#308266',
  '#E56E4F',
  '#944C68',
  '#977D33',
  '#9D5930',
  '#DC9A6C',
];

interface Props {
  explanation: NodeScore[] | undefined;
  uniqueNodes: number[] | undefined;
  nodeIdToColor: Map<number, string>;
  selectedNodeId: number | undefined;
  setSelectedNodeId: (nodeId: number) => void;
  renderCount: number;
  setRenderCount: (value: number) => void;
}

export function CorrelationBarSingle({
  explanation,
  uniqueNodes,
  nodeIdToColor,
  selectedNodeId,
  setSelectedNodeId,
  renderCount,
  setRenderCount,
}: Props) {
  const graphDiv = useRef<HTMLDivElement>(null);
  const [measureRef, _size] = useMeasure();
  const size = useThrottle(_size, 100);

  const drawGraph = () => {
    if (!graphDiv.current || !explanation || !uniqueNodes) {
      return;
    }
    const margin = { top: 0, right: 4, bottom: 0, left: 4 };
    const width = graphDiv.current.clientWidth - margin.left - margin.right;
    const height = 32;
    const borderOffset = 8;

    d3.select(graphDiv.current).select('svg').remove();

    const bar = d3
      .select(graphDiv.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    bar
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#FFFFFF');
    let barWidth = 0;
    for (const nodeId of uniqueNodes) {
      const importance = explanation.find((i) => i.nodeId == nodeId);
      if (
        nodeIdToColor.size >= colors.length ||
        barWidth >= width ||
        !importance
      ) {
        continue;
      }
      let color = nodeIdToColor.get(importance.nodeId);
      if (!color) {
        color = colors[nodeIdToColor.size];
        nodeIdToColor.set(importance.nodeId, color);
      }
      const item_width = Math.round(width * importance.score);
      bar
        .append('rect')
        .attr('x', barWidth)
        .attr('width', item_width)
        .attr('height', height)
        .attr('fill', color)
        .attr('nodeId', importance.nodeId)
        .attr('fill', 'black')
        .classed('opacity-0', true)
        .classed('transition-opacity', true);
      bar
        .append('rect')
        .attr('x', barWidth)
        .attr('y', borderOffset / 2)
        .attr('width', item_width)
        .attr('height', height - borderOffset)
        .attr('fill', color)
        .attr('clickNode', importance.nodeId)
        .datum(importance.nodeId);
      barWidth += item_width;
    }

    d3.select(graphDiv.current)
      .selectAll('[clickNode]')
      .on('click', (_e, d) => setSelectedNodeId(d));

    setRenderCount(renderCount + 1);
  };

  const selectNode = () => {
    if (!graphDiv.current && selectedNodeId != undefined) {
      return;
    }
    d3.select(graphDiv.current)
      .selectAll('[nodeId]')
      .classed('opacity-0', true);
    d3.select(graphDiv.current)
      .selectAll(`[nodeId="${selectedNodeId}"]`)
      .classed('opacity-0', false);
  };

  useEffect(() => {
    drawGraph();
    selectNode();
  }, [graphDiv, size]);

  useEffect(() => {
    selectNode();
  }, [selectedNodeId]);

  return (
    <div className="h-full" ref={measureRef}>
      <div className="h-full" ref={graphDiv}></div>
    </div>
  );
}
