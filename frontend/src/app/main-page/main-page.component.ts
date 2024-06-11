import { ChangeDetectionStrategy, Component, OnInit, Signal, computed, effect, model, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { ApiService } from '../services/api.service';
import Plan from '../services/data/plan';
import { PlanGraphComponent } from '../plan-graph/plan-graph.component';
import FullPlan from '../services/data/full-plan';
import GraphNode from '../services/data/graph-node';
import { MatButtonModule } from '@angular/material/button';
import Prediction from '../services/data/prediction';
import Explanation from '../services/data/explanation';
import { sort } from 'd3';
import ImportantFeatures from '../services/data/important-features';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import ExplainerType from '../services/data/explainer-type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DecimalPipe, PercentPipe } from '@angular/common';
import NodeType from '../services/data/node-type';
import NodeInfoType from '../services/data/node-info-type';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-main-page',
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
    MatRadioModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnInit {
  public plans = signal<Plan[]>([]);
  public displayedPlanColumns = signal<String[]>(['id', 'plans', 'tables', 'columns', 'filters', 'preds']);
  public selectedPlan = signal<Plan | undefined>(undefined);
  public selectedFullPlan = signal<FullPlan | undefined>(undefined);
  public selectedNode = signal<GraphNode | undefined>(undefined);
  public selectedPlanPrediction = signal<Prediction | undefined>(undefined);
  public selectedPlanExplanation = signal<Explanation | undefined>(undefined);
  public importantFeatures = signal<ImportantFeatures | undefined>(undefined);
  public explainerType = ExplainerType;
  public selectedExplainer = signal<ExplainerType>(ExplainerType.gradient);

  public displayedNodeColumns = computed(() => {
    const explanation = this.selectedPlanExplanation();
    const cols = ['attr', 'value'];
    if (explanation) {
      cols.push('importance');
    }

    return cols;
  });
  public selectedNodeInfoFields = computed(() => {
    let nodeInfo = structuredClone(this.selectedNode()?.nodeInfo);
    const importantFeatures = this.importantFeatures();
    if (!nodeInfo || !importantFeatures) {
      return [];
    }
    if ('planParameters' in nodeInfo) {
      nodeInfo = Object.assign(nodeInfo, nodeInfo['planParameters']) as NodeInfoType;
      delete nodeInfo['planParameters'];
    }
    if ('columnStats' in nodeInfo) {
      const colStats = structuredClone(nodeInfo['columnStats']);
      delete colStats['nodeType'];
      nodeInfo = Object.assign(nodeInfo, colStats) as NodeInfoType;
      delete nodeInfo['columnStats'];
    }
    for (const prop in nodeInfo) {
      if (nodeInfo[prop] == null || nodeInfo[prop] === '' || (nodeInfo[prop] instanceof Array && nodeInfo[prop].length == 0)) {
        delete nodeInfo[prop];
      }
    }

    const features = importantFeatures.features[nodeInfo.nodeType as NodeType];
    const values = Object.keys(nodeInfo).map(k => ({
      name: k,
      value: nodeInfo[k],
      isFeature: features.includes(k),
    }));

    const importance = this.selectedNodeFeatureImportance();
    if (!importance) {
      return sort(values, v => v.isFeature).reverse();
    }

    const valuesWithImportance = values.map(v => ({
      name: v.name,
      value: v.value,
      isFeature: v.isFeature,
      importance: v.name in importance ? importance[v.name] : undefined,
    }));

    return sort(valuesWithImportance, (v1, v2) => {
      const value1 = v1.importance;
      const value2 = v2.importance;
      if (value1 === value2) {
        return 0;
      }

      if (value1 === undefined) {
        return 1;
      }
      if (value2 === undefined) {
        return -1;
      }

      if (value2 > value1) {
        return 1;
      }
      if (value1 > value2) {
        return -1;
      }
      return 0;
    });
  });

  public selectedNodeFeatureImportance = computed(() => {
    const node = this.selectedNode();
    const explanation = this.selectedPlanExplanation();
    if (!node || !explanation) {
      return undefined;
    }
    return explanation.featureImportance[node.nodeId];
  });

  public nodeImportancesSorted = computed(() => {
    const explanation = this.selectedPlanExplanation();
    const plan = this.selectedFullPlan();
    const prediction = this.selectedPlanPrediction();
    if (!plan || !explanation || !prediction) {
      return;
    }
    const res = plan.graphNodes
      .filter(node => node.nodeId in explanation.nodeImportance)
      .map(node => ({
        node: node,
        importance: explanation.nodeImportance[node.nodeId],
        value: prediction.prediction * explanation.nodeImportance[node.nodeId],
      }));
    return sort(res, value => value.importance).reverse();
  });

  public selectedNodeImportance = computed(() => {
    const nodeImportances = this.nodeImportancesSorted();
    const selectedNode = this.selectedNode();
    if (!nodeImportances || !selectedNode) {
      return;
    }
    return nodeImportances.find(n => n.node.nodeId == selectedNode.nodeId);
  });

  public isLoading = computed(() => {
    return this.selectedPlan() && !(this.selectedFullPlan() && this.selectedPlanPrediction() && this.selectedPlanExplanation());
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getPlans().subscribe(value => this.plans.set(value));
    this.apiService.getImportantFeatures().subscribe(value => this.importantFeatures.set(value));
  }

  onPlanSelected(plan: Plan) {
    if (this.selectedPlan()?.id === plan.id) {
      return;
    }

    this.selectedPlan.set(plan);
    this.selectedFullPlan.set(undefined);
    this.selectedNode.set(undefined);
    this.selectedPlanPrediction.set(undefined);
    this.selectedPlanExplanation.set(undefined);
    if (plan) {
      this.apiService.getPlan(plan.id).subscribe(value => {
        this.selectedFullPlan.set(value);
        this.apiService.getPrediction(plan.id).subscribe(value => this.selectedPlanPrediction.set(value));
        this.apiService.getExplanation(plan.id, this.selectedExplainer()).subscribe(value => this.selectedPlanExplanation.set(value));
      });
    }
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
