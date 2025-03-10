/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { NodeScore } from '@/api/data/inference';
import { NodeType } from '@/api/data/nodeInfo';
import { FullPlan } from '@/api/data/queries';
import { useDebounce, useMeasure } from '@uidotdev/usehooks';
import * as d3 from 'd3';
import * as d3Graphviz from 'd3-graphviz';

interface Props {
  fullPlan: FullPlan;
  nodeId: number | undefined;
  setNodeId: (value: number) => void;
  importanceScores: NodeScore[] | undefined;
}

const nodeTypeToColor = {
  column: '#D5E8D4',
  filter_column: '#F8CECC',
  output_column: '#FFF2CC',
  table: '#DAE8FC',
  plan: '#F5F5F5',
  logical_pred_: '#F8CECC',
} satisfies Record<NodeType, string>;

function getImportanceColor(score: number) {
  if (score < 0.33) {
    // White to Yellow
    return `rgb(${255}, ${255}, ${Math.round(255 - score * 255)})`;
  } else {
    // Yellow to Red
    return `rgb(${255}, ${Math.round(255 - score * 255)}, ${0})`;
  }
}

export function QueryGraph({
  fullPlan,
  nodeId,
  setNodeId,
  importanceScores,
}: Props) {
  const graphDiv = useRef<HTMLDivElement>(null);
  const [graphviz, setGraphviz] = useState<
    d3Graphviz.Graphviz<d3.BaseType, any, d3.BaseType, any> | undefined
  >();

  const [measureRef, _size] = useMeasure();
  const size = useDebounce(_size, 100);

  const drawGraph = () => {
    if (!graphDiv.current || !graphviz) {
      return;
    }

    // Clean graph
    graphviz.renderDot('graph {}');

    const margin = { top: 16, right: 16, bottom: 16, left: 16 };
    const height = graphDiv.current.clientHeight - margin.left - margin.right;
    const width = graphDiv.current.clientWidth - margin.top - margin.bottom;

    graphviz
      .height(height + margin.top + margin.bottom)
      .width(width + margin.left + margin.right)
      .fit(true)
      .attributer(function (d) {
        if (d.tag == 'polygon' && d.parent.attributes.class == 'graph') {
          d.attributes.fill = 'transparent';
        }
        if (d.tag == 'svg') {
          d.attributes.class = 'absolute';
        }
      })
      .renderDot(fullPlan.dotGraph)
      .on('end', () => {
        setGraphInteractions();
      });
  };

  const drawSelectedNode = () => {
    if (!graphviz) {
      return;
    }
    const graphElement = d3.selectAll('#graph0');
    const nodes = graphElement.selectAll('.node');
    nodes
      .selectAll('ellipse')
      .classed('stroke-[2px]', true)
      .classed('stroke-[5px]', false);

    if (nodeId == undefined) {
      return;
    }
    const nodeToSelect = nodes
      .filter((e) => (e as any).key == nodeId)
      .selectAll('ellipse');
    nodeToSelect //
      .classed('stroke-[2px]', false)
      .classed('stroke-[5px]', true);
  };

  const setGraphInteractions = () => {
    if (!graphviz) {
      return;
    }
    graphviz.resetZoom();

    const graphElement = d3.selectAll('#graph0');
    const nodes = graphElement.selectAll('.node');

    nodes
      .selectAll('ellipse')
      .classed('transition-stroke stroke-black/60 stroke-[2px]', true);

    const setNodeHover = (enter: boolean, nodeId: string) => {
      nodes
        .filter('#' + nodeId)
        .selectAll('ellipse')
        .classed('stroke-black/60', !enter)
        .classed('stroke-black', enter);
    };

    const setNodeClick = (_: string, nodeKey: string) => {
      setNodeId(parseInt(nodeKey));
    };

    nodes.on('mouseover', (_e, d: any) => {
      setNodeHover(true, d.attributes.id);
    });

    nodes.on('mouseleave', (_e, d: any) => {
      setNodeHover(false, d.attributes.id);
    });

    nodes.on('click', (e: any, d: any) => {
      setNodeClick(d.attributes.id, d.key);
      e.stopPropagation();
    });

    drawSelectedNode();
    drawNodeColors();
  };

  const drawNodeColors = () => {
    if (!graphviz) {
      return;
    }
    const graphElement = d3.selectAll('#graph0');
    const nodes = graphElement.selectAll('.node');
    const ellipses = nodes.select('ellipse');

    if (importanceScores) {
      ellipses.attr('fill', (e: any) =>
        getImportanceColor(
          importanceScores.find((s) => s.nodeId == e.key)?.score ?? 0,
        ),
      );
    } else {
      ellipses.attr(
        'fill',
        (e: any) =>
          nodeTypeToColor[
            fullPlan.graphNodes.find((node) => node.nodeId == e.key)?.nodeInfo
              .nodeType ?? 'plan'
          ],
      );
    }
  };

  useEffect(() => {
    setGraphviz(
      d3Graphviz.graphviz(graphDiv.current, {
        useWorker: false,
      }),
    );
  }, []);

  useEffect(() => {
    drawGraph();
  }, [graphDiv, fullPlan, graphviz, size]);

  useEffect(() => {
    drawSelectedNode();
  }, [nodeId, graphviz]);

  useEffect(() => {
    drawNodeColors();
  }, [importanceScores, graphviz]);

  return (
    <div className="h-full" ref={measureRef}>
      <div
        className="h-full overflow-hidden contain-layout contain-paint"
        ref={graphDiv}
      ></div>
    </div>
  );
}
