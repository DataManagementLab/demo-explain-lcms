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
import ExplainerType from '../services/data/explainer_type';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [MatListModule, PlanGraphComponent, MatButtonModule, MatTableModule, MatSelectModule, MatFormFieldModule],
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
  public selectedNodePrediction = signal<Prediction | undefined>(undefined);
  public selectedNodeExplanation = signal<Explanation | undefined>(undefined);
  public importantFeatures = signal<ImportantFeatures | undefined>(undefined);
  public explainerType = ExplainerType;
  public selectedExplainer = signal<ExplainerType>(ExplainerType.gradient);

  public displayedNodeColumns = computed(() => {
    const explanation = this.selectedNodeExplanation();
    const cols = ['attr', 'value'];
    if (explanation) {
      cols.push('importance');
    }

    return cols;
  });
  public selectedNodeInfoFields = computed(() => {
    let nodeInfo = this.selectedNode()?.nodeInfo as any;
    const importantFeatures = this.importantFeatures();
    if (nodeInfo) {
      if ('planParameters' in nodeInfo) {
        nodeInfo = Object.assign(nodeInfo, nodeInfo.planParameters);
        delete nodeInfo.planParameters;
      }
      if ('columnStats' in nodeInfo) {
        nodeInfo = Object.assign(nodeInfo, nodeInfo.columnStats);
        delete nodeInfo.columnStats;
      }
      for (const prop in nodeInfo) {
        if (nodeInfo[prop] == null || nodeInfo[prop] == '') {
          delete nodeInfo[prop];
        }
      }
      let values = Object.keys(nodeInfo).map(k => ({
        name: k,
        value: nodeInfo[k],
        isFeature: false,
      }));

      if (importantFeatures) {
        values = values.map(v => ({
          name: v.name,
          value: v.value,
          isFeature: importantFeatures.features[nodeInfo.nodeType].includes(v.name),
        }));
        values = sort(values, v => v.isFeature).reverse();
      }

      return values;
    }
    return [];
  });

  public selectedNodeFeatureImportance = computed(() => {
    const node = this.selectedNode();
    const explanation = this.selectedNodeExplanation();
    if (!node || !explanation) {
      return undefined;
    }
    return explanation.featureImportance[String(node.nodeId)];
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getPlans().subscribe(value => this.plans.set(value));
    this.apiService.getImportantFeatures().subscribe(value => this.importantFeatures.set(value));
  }

  onPlanSelected(plan: Plan) {
    this.selectedPlan.set(plan);
    this.selectedNode.set(undefined);
    this.selectedNodePrediction.set(undefined);
    this.selectedNodeExplanation.set(undefined);
    if (plan) {
      this.apiService.getPlan(plan.id).subscribe(value => this.selectedFullPlan.set(value));
    }
  }

  onNodeSelected(node: GraphNode) {
    this.selectedNode.set(node);
  }

  onPredictClick() {
    const plan = this.selectedPlan();
    if (plan) {
      this.apiService.getPrediction(plan.id).subscribe(value => this.selectedNodePrediction.set(value));
    }
  }

  onExplainClick() {
    const plan = this.selectedPlan();
    if (plan) {
      this.apiService.getPrediction(plan.id).subscribe(value => this.selectedNodePrediction.set(value));
      this.apiService.getExplanation(plan.id, this.selectedExplainer()).subscribe(value => this.selectedNodeExplanation.set(value));
    }
  }
}
