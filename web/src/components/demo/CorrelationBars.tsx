import { useEffect, useRef } from 'react';
import { ExplainerType } from '@/api/data/inference';
import { useGetExplanations } from '@/api/inference';
import { useDemoStore } from '@/stores/demoStore';
import { useWindowSize } from '@uidotdev/usehooks';
import * as d3 from 'd3';
import { useShallow } from 'zustand/react/shallow';

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
  explainerTypes: ExplainerType[];
}

export default function CorrelationBars({ explainerTypes }: Props) {
  const graphDiv = useRef<HTMLDivElement>(null);
  const [queryId, selectedNodeId, setSelectedNodeId] = useDemoStore(
    useShallow((state) => [
      state.queryId,
      state.selectedNodeId,
      state.setSelectedNodeId,
    ]),
  );
  const explanations = useGetExplanations({
    queryId: queryId,
    explainerTypes: explainerTypes,
  });
  const windowSize = useWindowSize();

  const baseNodes = explanations.isSuccess
    ? explanations.data[0].scaledImportance.map((i) => i.nodeId)
    : undefined;

  const validExplanations = explanations.isSuccess
    ? explanations.data.map((explanation) =>
        explanation.scaledImportance.filter((i) => i.score >= 0.01),
      )
    : undefined;

  const importanceSortFn = (a: number, b: number) => {
    if (!validExplanations) {
      return 0;
    }
    const aExplanationId = validExplanations.findIndex((e) =>
      e.map((i) => i.nodeId).includes(a),
    );
    const bExplanationId = validExplanations.findIndex((e) =>
      e.map((i) => i.nodeId).includes(b),
    );
    if (aExplanationId != bExplanationId) {
      return bExplanationId - aExplanationId;
    }
    const explanation = validExplanations[aExplanationId];
    const aImportance = explanation.find((i) => i.nodeId == a);
    const bImportance = explanation.find((i) => i.nodeId == b);
    if (aImportance && bImportance) {
      return aImportance.score - bImportance.score;
    }
    return 0;
  };

  const uniqueNodes =
    validExplanations && baseNodes
      ? validExplanations
          .flat()
          .map((i) => i.nodeId)
          .filter((value, index, array) => array.indexOf(value) == index)
          .toSorted(importanceSortFn)
          .toReversed()
      : undefined;

  console.log(uniqueNodes);

  const drawGraph = () => {
    if (!graphDiv.current || !validExplanations || !uniqueNodes) {
      return;
    }
    const margin = { top: 0, right: 4, bottom: 0, left: 4 };
    const width = graphDiv.current.clientWidth - margin.left - margin.right;
    const height = 32;
    const marginBetweenBars = 8;
    const borderOffset = 8;

    d3.select(graphDiv.current).select('svg').remove();

    const svg = d3
      .select(graphDiv.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr(
        'height',
        (height + marginBetweenBars) * explainerTypes.length +
          margin.top +
          margin.bottom,
      )
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const nodeIdToColor = new Map<number, string>();
    let nextColorId = 0;
    let currentHeight = 0;
    for (const explanation of validExplanations) {
      const bar = svg
        .append('g')
        .attr('transform', 'translate(' + 0 + ',' + currentHeight + ')');
      bar
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#FFFFFF');
      let barWidth = 0;
      for (const nodeId of uniqueNodes) {
        const importance = explanation.find((i) => i.nodeId == nodeId);
        if (nextColorId >= colors.length || barWidth >= width || !importance) {
          continue;
        }
        let color = nodeIdToColor.get(importance.nodeId);
        if (!color) {
          color = colors[nextColorId++];
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
          .attr('opacity', 0)
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
      currentHeight += height + marginBetweenBars;
    }

    d3.select(graphDiv.current)
      .selectAll('[clickNode]')
      .on('click', (_e, d) => setSelectedNodeId(d));
  };

  const selectNode = () => {
    if (!graphDiv.current && selectedNodeId != undefined) {
      return;
    }
    d3.select(graphDiv.current).selectAll('[nodeId]').attr('opacity', 0);
    d3.select(graphDiv.current)
      .selectAll(`[nodeId="${selectedNodeId}"]`)
      .attr('opacity', 1);
  };

  useEffect(() => {
    drawGraph();
    selectNode();
  }, [graphDiv, explanations, windowSize]);

  useEffect(() => {
    selectNode();
  }, [selectedNodeId]);

  return <div className="h-full" ref={graphDiv}></div>;
}
