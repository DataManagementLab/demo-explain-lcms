import { Component, ElementRef, ViewChild, input, model, signal, AfterViewInit, effect } from '@angular/core';
import GraphNode from '../../services/data/graph-node';
import Explanation from '../../services/data/explanation';

import * as d3 from 'd3';
import recordToList from '../../utils/recordToList';
import FullPlan from '../../services/data/full-plan';

const colors = ['#ebac23', '#b80058', '#008cf9', '#006e00', '#00bbad', '#d163e6', '#b24502', '#5954d6', '#00c6f8', '#878500', '#00a76c', '#bdbdbd'];
// const colors = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];
// const colors = ['#00876c', '#3a966c', '#5ea56b', '#80b36a', '#a2c06b', '#c6cd6f', '#ebd877', '#edc063', '#eca855', '#eb8e4d', '#e6744a', '#df5a4c', '#d43d51'];

@Component({
  selector: 'expl-zs-cost-bar',
  standalone: true,
  imports: [],
  template: '<div class="h-full" #graphDiv></div>',
})
export class CostBarComponent implements AfterViewInit {
  @ViewChild('graphDiv') graphDivRef: ElementRef | undefined;
  private graphDiv = signal<HTMLDivElement | undefined>(undefined);

  selectedNode = model<GraphNode>();
  fullPlan = input.required<FullPlan>();
  explanation = input.required<Explanation>();
  nodesToShow = input.required<number[]>();

  constructor() {
    effect(() => this.drawGraph());
    effect(() => this.selectNode());
  }

  ngAfterViewInit(): void {
    if (this.graphDivRef) {
      this.graphDiv.set(this.graphDivRef.nativeElement);
    }
  }

  drawGraph() {
    const graphDiv = this.graphDiv();

    if (!graphDiv) {
      return;
    }
    const margin = { top: 0, right: 4, bottom: 0, left: 4 };
    const width = graphDiv.clientWidth - margin.left - margin.right;
    const height = 32;

    d3.select(graphDiv).select('svg').remove();

    const svg = d3
      .select(graphDiv)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#FFFFFF');

    const recordList = recordToList(this.explanation().nodeImportance);
    let x = 0;
    let i = 0;
    for (const item of recordList) {
      if (i >= colors.length) {
        break;
      }
      if (!this.nodesToShow().includes(Number.parseInt(item.key))) {
        continue;
      }
      const borderOffset = 8;
      svg
        .append('rect')
        .attr('x', x)
        .attr('width', width * item.value)
        .attr('height', height)
        .attr('fill', colors[i])
        .attr('nodeId', item.key)
        .attr('fill', 'transparent');
      svg
        .append('rect')
        .attr('x', x)
        .attr('y', borderOffset / 2)
        .attr('width', width * item.value)
        .attr('height', height - borderOffset)
        .attr('fill', colors[i])
        .attr('clickNode', item.key)
        .datum(item.key);
      x += width * item.value;
      i++;
    }

    d3.select(graphDiv)
      .selectAll('[clickNode]')
      .on('click', (_e, d) => this.selectedNode.set(this.fullPlan().graphNodes.find(node => node.nodeId == d)));
  }

  selectNode() {
    const node = this.selectedNode();
    const graphDiv = this.graphDiv();
    if (!node || !graphDiv) {
      return;
    }

    d3.select(graphDiv).selectAll('[nodeId]').attr('fill', 'transparent');
    d3.select(graphDiv).select(`[nodeId="${node.nodeId}"]`).attr('fill', 'black');
  }
}
