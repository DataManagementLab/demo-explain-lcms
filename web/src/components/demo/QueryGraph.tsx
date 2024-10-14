/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { FullPlan } from '@/api/data/demo';
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
  const setSelectedNode = useDemoStore(
    useShallow((store) => store.setSelectedNode),
  );
  const windowSize = useWindowSize();

  const drawGraph = () => {
    if (!graphDiv.current || !fullPlan || !graphviz) {
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
        'transition-stroke fill-white stroke-black/60 stroke-[2px]',
        true,
      );

    const setNodeHover = (enter: boolean, nodeId: string) => {
      nodes
        .filter('#' + nodeId)
        .selectAll('ellipse')
        .classed('stroke-black/60', !enter)
        .classed('stroke-black', enter);
    };

    const setNodeClick = (nodeId: string, nodeKey: string) => {
      nodes //
        .selectAll('ellipse')
        .classed(' stroke-[2px]', true)
        .classed('stroke-[5px]', false);
      nodes
        .filter('#' + nodeId)
        .selectAll('ellipse')
        .classed(' stroke-[2px]', false)
        .classed('stroke-[5px]', true);

      if (fullPlan) {
        const graphNode = fullPlan.graphNodes.find(
          (n) => n.nodeId == parseInt(nodeKey),
        );
        setSelectedNode(graphNode);
        console.log('Selected', graphNode);
      }
    };

    nodes.on('mouseover', (_e, d: any) => {
      setNodeHover(true, d.attributes.id);
    });

    nodes.on('mouseleave', (_e, d: any) => {
      setNodeHover(false, d.attributes.id);
    });

    nodes.on('click', (_e, d: any) => {
      setNodeClick(d.attributes.id, d.key);
    });
  };

  useEffect(() => {
    if (graphDiv) {
      setGraphviz(
        d3Graphviz.graphviz(graphDiv.current, {
          useWorker: false,
        }),
      );
    }
  }, []);

  useEffect(() => {
    drawGraph();
  }, [graphDiv, fullPlan, graphviz, windowSize]);

  // useEffect(() => {
  //   setGraphInteractions();
  // }, [graphDiv, fullPlan, graphviz]);

  return <div className="h-full" ref={graphDiv}></div>;
}
