import { Component, ElementRef, ViewChild, input, model, signal, AfterViewInit, effect } from '@angular/core';
import GraphNode from '../../services/data/graph-node';
import Explanation from '../../services/data/explanation';

import * as d3 from 'd3';
import recordToList from '../../utils/recordToList';
import FullPlan from '../../services/data/full-plan';

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
    recordList.sort((x, y) => this.nodesToShow().indexOf(Number.parseInt(x.key)) - this.nodesToShow().indexOf(Number.parseInt(y.key)));
    let x = 0;
    let i = 0;
    for (const item of recordList) {
      if (i >= colors.length || x >= width) {
        break;
      }
      if (!this.nodesToShow().includes(Number.parseInt(item.key))) {
        continue;
      }
      const colorId = this.nodesToShow().indexOf(Number.parseInt(item.key));
      if (colorId == -1 || colorId > colors.length) {
        console.error(`Not enough colors: ${colorId}`);
        continue;
      }
      const color = colors[colorId];
      const borderOffset = 8;
      const item_width = Math.round(width * item.value);
      svg
        .append('rect')
        .attr('x', x)
        .attr('width', item_width)
        .attr('height', height)
        .attr('fill', color)
        .attr('nodeId', item.key)
        .attr('fill', 'black')
        .attr('opacity', 0)
        .classed('transition-opacity', true);
      svg
        .append('rect')
        .attr('x', x)
        .attr('y', borderOffset / 2)
        .attr('width', item_width)
        .attr('height', height - borderOffset)
        .attr('fill', color)
        .attr('clickNode', item.key)
        .datum(item.key);
      x += item_width;
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

    d3.select(graphDiv).selectAll('[nodeId]').attr('opacity', 0);
    d3.select(graphDiv).select(`[nodeId="${node.nodeId}"]`).attr('opacity', 1);
  }
}
