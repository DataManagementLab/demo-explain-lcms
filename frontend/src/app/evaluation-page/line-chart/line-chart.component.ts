import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation, effect, input, signal } from '@angular/core';
import TableToScoreEvaluation, { TableToScore } from '../../services/data/table-to-score-evaluation';

import * as d3 from 'd3';

@Component({
  selector: 'expl-zs-line-chart',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  template: "<div class='h-full' #graphDiv></div>",
})
export class LineChartComponent implements AfterViewInit {
  @ViewChild('graphDiv') graphDivRef: ElementRef | undefined;
  private graphDiv = signal<HTMLDivElement | undefined>(undefined);

  chartData = input.required<TableToScoreEvaluation>();
  maxScore = input<number | undefined>();
  xTitle = input.required<string>();
  yTitle = input.required<string>();

  constructor() {
    effect(() => this.drawGraph());
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
    const margin = { top: 16, right: 16, bottom: 52, left: 52 };
    const height = graphDiv.clientHeight - margin.left - margin.right;
    const width = graphDiv.clientWidth - margin.top - margin.bottom;

    const svg = d3
      .select(graphDiv)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const maxTableCount = Math.max(...this.chartData().scores.map(s => s.tableCount)) + 1;
    const x = d3 //
      .scaleLinear()
      .domain([0, maxTableCount])
      .range([0, width]);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(maxTableCount));

    const maxScore = this.maxScore() ?? Math.ceil(Math.max(...this.chartData().scores.map(s => s.score)));

    const y = d3 //
      .scaleLinear()
      .domain([0, maxScore])
      .range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    svg
      .append('path')
      .datum(this.chartData().scores)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line<TableToScore>()
          .x(function (d) {
            return x(d.tableCount);
          })
          .y(function (d) {
            return y(d.score);
          })
      );

    svg
      .append('text')
      .classed('font-bold', true)
      .attr('text-anchor', 'end')
      .attr('x', width)
      .attr('y', height + margin.top + 20)
      .text(this.xTitle());

    svg
      .append('text')
      .classed('font-bold', true)
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -margin.top)
      .text(this.yTitle());
  }
}
