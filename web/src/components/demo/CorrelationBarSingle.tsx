import { useEffect, useRef } from 'react';
import { NodeScore } from '@/api/data/inference';
import { getBarColor } from '@/lib/barColors';
import { useMeasure, useThrottle } from '@uidotdev/usehooks';
import * as d3 from 'd3';

interface Props {
  explanation: NodeScore[] | undefined;
  selectedNodeId: number | undefined;
  setSelectedNodeId: (nodeId: number) => void;
}

export function CorrelationBarSingle({
  explanation,
  selectedNodeId,
  setSelectedNodeId,
}: Props) {
  const graphDiv = useRef<HTMLDivElement>(null);
  const [measureRef, _size] = useMeasure();
  const size = useThrottle(_size, 100);

  const drawGraph = () => {
    if (!graphDiv.current || !explanation) {
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

    const sortedNodes = explanation
      .toSorted((a) => a.nodeId)
      .map((nodeScore) => nodeScore.nodeId);

    for (const nodeId of sortedNodes) {
      const importance = explanation.find((i) => i.nodeId == nodeId);
      const name = 'TODO';
      if (barWidth >= width || !importance) {
        continue;
      }
      const color = getBarColor(importance.nodeId);
      const item_width = Math.round(width * importance.score);
      bar
        .append('rect')
        .attr('x', barWidth)
        .attr('width', item_width)
        .attr('height', height)
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

      if (item_width >= 30) {
        bar
          .append('text')
          .attr('x', barWidth + item_width / 2)
          .attr('y', height / 2)
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '10px') // Adjust the font size here
          .text(name);
      }
      barWidth += item_width;
    }

    if (barWidth < width) {
      bar
        .append('rect')
        .attr('x', barWidth)
        .attr('y', borderOffset / 2)
        .attr('width', width - barWidth)
        .attr('height', height - borderOffset)
        .attr('fill', 'black');
    }

    d3.select(graphDiv.current)
      .selectAll('[clickNode]')
      .on('click', (_e, d) => setSelectedNodeId(d as number));
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
