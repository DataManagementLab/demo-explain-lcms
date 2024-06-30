import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { ApiService } from '../services/api.service';
import Plan from '../services/data/plan';
import { PlanGraphComponent } from '../plan-graph/plan-graph.component';
import FullPlan from '../services/data/full-plan';
import GraphNode from '../services/data/graph-node';
import { MatButtonModule } from '@angular/material/button';
import Prediction from '../services/data/prediction';
import Explanation from '../services/data/explanation';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import ExplainerType from '../services/data/explainer-type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlanListComponent } from './plan-list/plan-list.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, of, switchMap } from 'rxjs';
import { ExplainerSelectComponent } from './explainer-select/explainer-select.component';
import { PredictionBlockComponent } from './prediction-block/prediction-block.component';
import { NodeImportanceListComponent } from './node-importance-list/node-importance-list.component';
import { NodeInfoListComponent } from './node-info-list/node-info-list.component';

@Component({
  selector: 'expl-zs-main-page',
  standalone: true,
  imports: [
    MatListModule,
    PlanGraphComponent,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    DecimalPipe,
    PercentPipe,
    MatDividerModule,
    MatProgressSpinnerModule,
    PlanListComponent,
    ExplainerSelectComponent,
    PredictionBlockComponent,
    NodeImportanceListComponent,
    NodeInfoListComponent,
  ],
  templateUrl: './main-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid grid-cols-2 grid-rows-full gap-8 box-border max-h-full px-4 py-8 relative' },
})
export class MainPageComponent implements OnInit {
  plans = signal<Plan[]>([]);
  selectedPlan = signal<Plan | undefined>(undefined);
  private selectedPlan$ = toObservable(this.selectedPlan);
  selectedFullPlan = signal<FullPlan | undefined>(undefined);
  selectedNode = signal<GraphNode | undefined>(undefined);
  selectedPlanPrediction = signal<Prediction | undefined>(undefined);
  selectedPlanExplanation = signal<Explanation | undefined>(undefined);
  selectedExplainer = signal<ExplainerType>(ExplainerType.gradient);
  private selectedExplainer$ = toObservable(this.selectedExplainer);

  isLoading = computed(() => {
    return this.selectedPlan() && !(this.selectedFullPlan() && this.selectedPlanPrediction() && this.selectedPlanExplanation());
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getPlans().subscribe(value => this.plans.set(value));

    this.selectedPlan$.subscribe(() => {
      this.selectedFullPlan.set(undefined);
      this.selectedNode.set(undefined);
      this.selectedPlanPrediction.set(undefined);
      this.selectedPlanExplanation.set(undefined);
    });
    this.selectedPlan$.pipe(switchMap(plan => (plan ? this.apiService.getPlan(plan.id) : of(undefined)))).subscribe(value => this.selectedFullPlan.set(value));
    this.selectedPlan$
      .pipe(switchMap(plan => (plan ? this.apiService.getPrediction(plan.id) : of(undefined))))
      .subscribe(value => this.selectedPlanPrediction.set(value));
    combineLatest([this.selectedPlan$, this.selectedExplainer$])
      .pipe(switchMap(([plan, explainerType]) => (plan ? this.apiService.getExplanation(plan.id, explainerType) : of(undefined))))
      .subscribe(value => this.selectedPlanExplanation.set(value));
  }

  onNodeSelected(node: GraphNode) {
    this.selectedNode.set(node);
  }

  onExplainerSelected(explainerType: ExplainerType) {
    this.selectedExplainer.set(explainerType);
    const plan = this.selectedPlan();
    if (plan) {
      this.apiService.getExplanation(plan.id, explainerType).subscribe(value => this.selectedPlanExplanation.set(value));
    }
  }

  onPredictClick() {
    const plan = this.selectedPlan();
    if (plan) {
      this.apiService.getPrediction(plan.id).subscribe(value => this.selectedPlanPrediction.set(value));
    }
  }

  onExplainClick() {
    const plan = this.selectedPlan();
    if (plan) {
      this.apiService.getPrediction(plan.id).subscribe(value => this.selectedPlanPrediction.set(value));
      this.apiService.getExplanation(plan.id, this.selectedExplainer()).subscribe(value => this.selectedPlanExplanation.set(value));
    }
  }
}
