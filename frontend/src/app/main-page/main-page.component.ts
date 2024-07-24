import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { ApiService } from '../services/api.service';
import Plan from '../services/data/plan';
import { PlanGraphComponent } from '../plan-graph/plan-graph.component';
import FullPlan from '../services/data/full-plan';
import GraphNode from '../services/data/graph-node';
import Prediction from '../services/data/prediction';
import Explanation from '../services/data/explanation';
import ExplainerType from '../services/data/explainer-type';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlanListComponent } from './plan-list/plan-list.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, of, switchMap } from 'rxjs';
import { ExplainerSelectComponent } from './explainer-select/explainer-select.component';
import { PredictionBlockComponent } from './prediction-block/prediction-block.component';
import { NodeImportanceListComponent } from './node-importance-list/node-importance-list.component';
import { NodeInfoListComponent } from './node-info-list/node-info-list.component';
import { CostBarComponent } from './cost-bar/cost-bar.component';
import FidelityEvaluation from '../services/data/fidelity-evaluation';
import { ExplainerEvaluationBlockComponent } from './explainer-evaluation-block/explainer-evaluation-block.component';

@Component({
  selector: 'expl-zs-main-page',
  standalone: true,
  imports: [
    PlanGraphComponent,
    MatDividerModule,
    MatProgressSpinnerModule,
    PlanListComponent,
    ExplainerSelectComponent,
    PredictionBlockComponent,
    NodeImportanceListComponent,
    NodeInfoListComponent,
    CostBarComponent,
    ExplainerEvaluationBlockComponent,
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
  actualExplanation = signal<Explanation | undefined>(undefined);
  selectedPlanFidelityEvaluaiton = signal<FidelityEvaluation | undefined>(undefined);

  isLoading = computed(() => {
    return this.selectedPlan() && !(this.selectedFullPlan() && this.selectedPlanPrediction() && this.selectedPlanExplanation());
  });

  fullCost = computed(() => {
    const prediction = this.selectedPlanPrediction();
    if (!prediction) {
      return undefined;
    }
    return this.selectedExplainer() == ExplainerType.actual ? prediction.label : prediction.prediction;
  });

  allExplanationNodes = computed(() => {
    const actualExplanation = this.actualExplanation();
    const explanation = this.selectedPlanExplanation();
    if (!actualExplanation || !explanation) {
      return undefined;
    }
    const minExplanation = 0.001;
    const nodes = Object.keys(actualExplanation.nodeImportance)
      .concat(Object.keys(explanation.nodeImportance))
      .map(value => Number.parseInt(value))
      .filter((value, index, arr) => arr.indexOf(value) == index)
      .filter(value => actualExplanation.nodeImportance[value] > minExplanation || explanation.nodeImportance[value] > minExplanation);
    nodes
      .sort((x, y) => {
        if (actualExplanation.nodeImportance[x] == undefined) {
          return -1;
        }
        return actualExplanation.nodeImportance[x] - actualExplanation.nodeImportance[y];
      })
      .reverse();
    return nodes;
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getPlans().subscribe(value => this.plans.set(value));

    this.selectedPlan$.subscribe(() => {
      this.selectedFullPlan.set(undefined);
      this.selectedNode.set(undefined);
      this.selectedPlanPrediction.set(undefined);
      this.selectedPlanExplanation.set(undefined);
      this.selectedPlanFidelityEvaluaiton.set(undefined);
    });
    this.selectedPlan$.pipe(switchMap(plan => (plan ? this.apiService.getPlan(plan.id) : of(undefined)))).subscribe(value => this.selectedFullPlan.set(value));
    this.selectedPlan$
      .pipe(switchMap(plan => (plan ? this.apiService.getPrediction(plan.id) : of(undefined))))
      .subscribe(value => this.selectedPlanPrediction.set(value));
    combineLatest([this.selectedPlan$, this.selectedExplainer$])
      .pipe(switchMap(([plan, explainerType]) => (plan ? this.apiService.getExplanation(plan.id, explainerType) : of(undefined))))
      .subscribe(value => this.selectedPlanExplanation.set(value));
    combineLatest([this.selectedPlan$, this.selectedExplainer$])
      .pipe(switchMap(([plan, explainerType]) => (plan ? this.apiService.getFidelityEvaluation(plan.id, explainerType) : of(undefined))))
      .subscribe(value => this.selectedPlanFidelityEvaluaiton.set(value));
    this.selectedPlan$
      .pipe(switchMap(plan => (plan ? this.apiService.getExplanation(plan.id, ExplainerType.actual) : of(undefined))))
      .subscribe(value => this.actualExplanation.set(value));
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
