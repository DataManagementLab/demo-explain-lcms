/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { FullPlan } from '@/api/data/queries';
import { useDemoStore } from '@/stores/demoStore';
import { useWindowSize } from '@uidotdev/usehooks';
import * as d3 from 'd3';
import * as d3Graphviz from 'd3-graphviz';
import { useShallow } from 'zustand/react/shallow';

interface Props {
  fullPlan: FullPlan;
}

export default function QueryGraph({ fullPlan }: Props) {
  const graphDiv = useRef<HTMLDivElement>(null);
  const [graphviz, setGraphviz] = useState<
    d3Graphviz.Graphviz<d3.BaseType, any, d3.BaseType, any> | undefined
  >();
  const [selectedNodeId, setSelectedNodeId] = useDemoStore(
    useShallow((state) => [state.selectedNodeId, state.setSelectedNodeId]),
  );
  const windowSize = useWindowSize();

  const drawGraph = () => {
    if (!graphDiv.current || !graphviz) {
      return;
    }

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
      })
      .renderDot(fullPlan.dotGraph)
      .on('end', () => {
        setGraphInteractions();
        // this.drawImportance();
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

    if (selectedNodeId == undefined) {
      return;
    }
    const nodeToSelect = nodes
      .filter((e) => (e as any).key == selectedNodeId)
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
      .classed(
        'transition-stroke fill-background stroke-black/60 stroke-[2px]',
        true,
      );

    const setNodeHover = (enter: boolean, nodeId: string) => {
      nodes
        .filter('#' + nodeId)
        .selectAll('ellipse')
        .classed('stroke-black/60', !enter)
        .classed('stroke-black', enter);
    };

    const setNodeClick = (_: string, nodeKey: string) => {
      setSelectedNodeId(parseInt(nodeKey));
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
  }, [graphDiv, fullPlan, graphviz, windowSize]);

  useEffect(() => {
    drawSelectedNode();
  }, [selectedNodeId, graphviz]);

  return <div className="h-full" ref={graphDiv}></div>;
}
