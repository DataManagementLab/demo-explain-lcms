import { AfterViewInit, Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import TableToScoreEvaluation, { TableToScore } from '../../services/data/table-to-score-evaluation';

import * as d3 from 'd3';
import * as d3Graphviz from 'd3-graphviz';

@Component({
  selector: 'expl-zs-line-chart',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements AfterViewInit {
  private _chartData: TableToScoreEvaluation | undefined;
  private _viewInit = false;

  private div: HTMLDivElement | undefined;
  @ViewChild('graphDiv') divRef: ElementRef | undefined;

  @Input() set chartData(value: TableToScoreEvaluation | undefined) {
    this._chartData = value;

    if (value && this._viewInit) {
      this.drawGraph();
    }
  }

  @Input() maxScore: number | undefined;
  @Input() xTitle: string = '';
  @Input() yTitle: string = '';

  ngAfterViewInit(): void {
    this._viewInit = true;
    if (this.divRef) {
      this.div = this.divRef.nativeElement;
    }
    if (this._chartData) {
      this.drawGraph();
    }
  }

  drawGraph() {
    if (!this.div || !this._chartData) {
      return;
    }
    const margin = { top: 16, right: 16, bottom: 52, left: 52 };
    const height = this.div.clientHeight - margin.left - margin.right;
    const width = this.div.clientWidth - margin.top - margin.bottom;

    const svg = d3
      .select(this.div)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const maxTableCount = Math.max(...this._chartData.scores.map(s => s.tableCount)) + 1;
    const x = d3 //
      .scaleLinear()
      .domain([0, maxTableCount])
      .range([0, width]);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(maxTableCount));

    const maxScore = this.maxScore ?? Math.ceil(Math.max(...this._chartData.scores.map(s => s.score)));

    const y = d3 //
      .scaleLinear()
      .domain([0, maxScore])
      .range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    svg
      .append('path')
      .datum(this._chartData.scores)
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
      .attr('class', 'axisLabel')
      .attr('text-anchor', 'end')
      .attr('x', width)
      .attr('y', height + margin.top + 20)
      .text(this.xTitle);

    svg
      .append('text')
      .attr('class', 'axisLabel')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -margin.top)
      .text(this.yTitle);
  }
}
