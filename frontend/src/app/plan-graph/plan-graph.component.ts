import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewEncapsulation, effect, model } from '@angular/core';
import FullPlan from '../services/data/full-plan';

import * as d3 from 'd3';
import * as d3Graphviz from 'd3-graphviz';
import GraphNode from '../services/data/graph-node';
import Explanation from '../services/data/explanation';

@Component({
  selector: 'app-plan-graph',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './plan-graph.component.html',
  styleUrl: './plan-graph.component.scss',
})
export class PlanGraphComponent implements AfterViewInit {
  private viewInit = false;
  private plan: FullPlan | undefined;
  private _explanation: Explanation | undefined;

  private div: HTMLDivElement | undefined;
  @ViewChild('graphDiv') divRef: ElementRef | undefined;

  private graphviz: d3Graphviz.Graphviz<d3.BaseType, any, d3.BaseType, any> | undefined;

  @Input() set graph(value: FullPlan | undefined) {
    this.plan = value;

    if (value && this.viewInit) {
      if (this.graphviz) {
        this.graphviz.resetZoom();
      }
      this.drawGraph();
    }
  }

  @Input() set explanation(value: Explanation | undefined) {
    this._explanation = value;
    if (value && this.viewInit) {
      this.drawImportance();
    }
  }

  selectedNode = model<GraphNode | undefined>();

  constructor() {
    effect(() => {
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
    });
  }

  ngAfterViewInit(): void {
    this.viewInit = true;
    if (this.divRef) {
      this.div = this.divRef.nativeElement;
    }
    if (this.plan) {
      this.drawGraph();
      this.drawImportance();
    }
  }

  drawGraph(): void {
    if (!this.div || !this.plan) {
      return;
    }
    this.graphviz = d3Graphviz.graphviz(this.div, { useWorker: false });
    if (!this.graphviz) {
      return;
    }

    const margin = { top: 16, right: 16, bottom: 16, left: 16 };
    const height = this.div.clientHeight - margin.left - margin.right;
    const width = this.div.clientWidth - margin.top - margin.bottom;

    this.graphviz
      .height(height + margin.top + margin.bottom)
      .width(width + margin.left + margin.right)
      .fit(true)
      .attributer(function (d) {
        if (d.tag == 'polygon' && d.parent.attributes.class == 'graph') d.attributes.fill = 'transparent';
      })
      .renderDot(this.plan.dotGraph)
      .on('end', () => {
        this.setInteractions();
        this.drawImportance();
      });
  }

  setInteractions() {
    if (!this.graphviz) {
      return;
    }
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

      if (this.plan) {
        const graphNode = this.plan.graphNodes.find(n => n.nodeId == parseInt(nodeKey));
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
    if (!this.graphviz) {
      return;
    }
    const graphElement = d3.selectAll('#graph0');
    const nodes = graphElement.selectAll('.node');
    const value = this._explanation?.nodeImportance;
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
}
