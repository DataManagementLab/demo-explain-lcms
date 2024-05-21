import { Component, OnInit, Signal, computed, effect, signal } from '@angular/core';
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

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [MatListModule, PlanGraphComponent, MatButtonModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent implements OnInit {
  public plans = signal<Plan[]>([]);
  public selectedPlan = signal<Plan | undefined>(undefined);
  public selectedFullPlan = signal<FullPlan | undefined>(undefined);
  public selectedNode = signal<GraphNode | undefined>(undefined);
  public selectedNodePrediction = signal<Prediction | undefined>(undefined);
  public selectedNodeExplanation = signal<Explanation | undefined>(undefined);
  public importantFeatures = signal<ImportantFeatures | undefined>(undefined);

  public selectedNodeInfoFields = computed(() => {
    let nodeInfo = this.selectedNode()?.nodeInfo as any;
    const importantFeatures = this.importantFeatures();
    if (nodeInfo) {
      if ('planParameters' in nodeInfo) {
        nodeInfo = Object.assign(nodeInfo, nodeInfo.planParameters);
        delete nodeInfo.planParameters;
      }
      for (const prop in nodeInfo) {
        if (String(nodeInfo[prop]) == '') {
          delete nodeInfo[prop];
        }
      }
      const values = Object.keys(nodeInfo).map(k => ({ name: k, value: nodeInfo[k] }));
      if (importantFeatures) {
        return sort(values, v => importantFeatures.features[nodeInfo.nodeType].includes(v.name)).reverse();
      } else {
        return values;
      }
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
      this.apiService.getExplanation(plan.id).subscribe(value => this.selectedNodeExplanation.set(value));
    }
  }
}
