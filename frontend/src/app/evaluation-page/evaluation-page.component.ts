import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../services/api.service';
import TableToScoreEvaluation from '../services/data/table-to-score-evaluation';
import ExplainerType from '../services/data/explainer-type';
import PartialRecord from '../utils/partial-record';
import MostImportantNodeEvaluation from '../services/data/most-important-node-evaluation';
import { MostImportantNodeTableComponent } from './most-important-node-table/most-important-node-table.component';
import { LineChartComponent } from './line-chart/line-chart.component';

@Component({
  selector: 'expl-zs-evaluation-page',
  standalone: true,
  imports: [MostImportantNodeTableComponent, LineChartComponent],
  templateUrl: './evaluation-page.component.html',
  styleUrl: './evaluation-page.component.scss',
})
export class EvaluationPageComponent implements OnInit {
  constructor(private apiService: ApiService) {}

  explainerTypeEnum = ExplainerType;
  mostImportantNodeEvaluation = signal<PartialRecord<ExplainerType, MostImportantNodeEvaluation>>({});
  costEvaluations = signal<PartialRecord<ExplainerType, TableToScoreEvaluation>>({});
  fidelityEvaluation = signal<PartialRecord<ExplainerType, TableToScoreEvaluation>>({});

  ngOnInit(): void {
    this.apiService
      .getCostEvaluationAll(ExplainerType.gradient)
      .subscribe(response => this.costEvaluations.update(value => ({ ...value, [ExplainerType.gradient]: response })));
    this.apiService
      .getCostEvaluationAll(ExplainerType.guidedBackpropagation)
      .subscribe(response => this.costEvaluations.update(value => ({ ...value, [ExplainerType.guidedBackpropagation]: response })));

    this.apiService
      .getMostImportantNodeEvaluationAll(ExplainerType.gradient)
      .subscribe(response => this.mostImportantNodeEvaluation.update(value => ({ ...value, [ExplainerType.gradient]: response })));
    this.apiService
      .getMostImportantNodeEvaluationAll(ExplainerType.guidedBackpropagation)
      .subscribe(response => this.mostImportantNodeEvaluation.update(value => ({ ...value, [ExplainerType.guidedBackpropagation]: response })));

    this.apiService
      .getFidelityEvaluationAll(ExplainerType.gradient)
      .subscribe(response => this.fidelityEvaluation.update(value => ({ ...value, [ExplainerType.gradient]: response })));
    this.apiService
      .getFidelityEvaluationAll(ExplainerType.guidedBackpropagation)
      .subscribe(response => this.fidelityEvaluation.update(value => ({ ...value, [ExplainerType.guidedBackpropagation]: response })));
  }
}
