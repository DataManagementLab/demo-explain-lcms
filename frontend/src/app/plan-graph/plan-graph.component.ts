/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation, effect, input, model, signal } from '@angular/core';
import FullPlan from '../services/data/full-plan';

import * as d3 from 'd3';
import * as d3Graphviz from 'd3-graphviz';
import GraphNode from '../services/data/graph-node';
import Explanation from '../services/data/explanation';

@Component({
  selector: 'expl-zs-plan-graph',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  template: "<div class='h-full' #graphDiv></div>",
  styleUrl: './plan-graph.component.scss',
})
export class PlanGraphComponent implements AfterViewInit {
  private graphviz = signal<d3Graphviz.Graphviz<d3.BaseType, any, d3.BaseType, any> | undefined>(undefined);
  @ViewChild('graphDiv') graphDivRef: ElementRef | undefined;
  private graphDiv = signal<HTMLDivElement | undefined>(undefined);

  private wasViewInit = signal<boolean>(false);
  fullPlan = input.required<FullPlan>();
  explanation = input<Explanation>();
  selectedNode = model<GraphNode | undefined>();

  constructor() {
    effect(() => this.drawGraph());
    effect(() => this.drawImportance());
    effect(() => this.setSelectedNode());
  }

  ngAfterViewInit(): void {
    if (this.graphDivRef) {
      this.graphDiv.set(this.graphDivRef.nativeElement);
      this.graphviz.set(d3Graphviz.graphviz(this.graphDivRef.nativeElement, { useWorker: false }));
      this.wasViewInit.set(true);
    }
  }

  drawGraph(): void {
    const graphDiv = this.graphDiv();
    const fullPlan = this.fullPlan();
    const graphviz = this.graphviz();
    if (!this.wasViewInit() || !graphDiv || !fullPlan || !graphviz) {
      return;
    }

    const margin = { top: 16, right: 16, bottom: 16, left: 16 };
    const height = graphDiv.clientHeight - margin.left - margin.right;
    const width = graphDiv.clientWidth - margin.top - margin.bottom;

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
        this.setGraphInteractions();
        this.drawImportance();
      });
  }

  setGraphInteractions() {
    if (!this.graphviz()) {
      return;
    }
    this.graphviz()!.resetZoom();
    const graphElement = d3.selectAll('#graph0');
    const nodes = graphElement.selectAll('.node');

    nodes.selectAll('ellipse').attr('fill', '#FFFFFF');

    const setNodeHover = (enter: boolean, nodeId: string) => {
      nodes
        .filter('#' + nodeId)
        .selectAll('ellipse')
        .classed('hover', enter);
    };

    const setNodeClick = (nodeId: string, nodeKey: string) => {
      nodes //
        .selectAll('ellipse')
        .classed('selected', false);
      nodes
        .filter('#' + nodeId)
        .selectAll('ellipse')
        .classed('selected', true);

      const fullPlan = this.fullPlan();
      if (fullPlan) {
        const graphNode = fullPlan.graphNodes.find(n => n.nodeId == parseInt(nodeKey));
        this.selectedNode.set(graphNode);
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
  }

  drawImportance() {
    if (!this.graphviz()) {
      return;
    }
    const graphElement = d3.selectAll('#graph0');
    const nodes = graphElement.selectAll('.node');
    const value = this.explanation()?.nodeImportance;
    if (!value) {
      nodes.selectAll('ellipse').attr('fill', '#FFFFFF');
      return;
    }

    nodes
      .filter((d: any) => d.key in value)
      .selectAll('ellipse')
      .attr('fill', '#DE524E')
      .attr('fill-opacity', (d: any) => {
        return value[d.parent.key] * 2;
      });
  }

  setSelectedNode() {
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return;
    }
    const graphElement = d3.selectAll('#graph0');
    const nodes = graphElement.selectAll('.node');
    const nodeToSelect = nodes.filter(e => (e as any).key == selectedNode.nodeId).selectAll('ellipse');
    if (nodeToSelect.classed('selected')) {
      return;
    }
    nodes //
      .selectAll('ellipse')
      .classed('selected', false);
    nodeToSelect //
      .classed('selected', true);
  }
}
