import { Component, OnInit, computed, input, signal } from '@angular/core';
import GraphNode from '../../services/data/graph-node';
import Prediction from '../../services/data/prediction';
import Explanation from '../../services/data/explanation';
import { getNodeImportance } from '../../utils/main-page-utils';
import { DecimalPipe, PercentPipe } from '@angular/common';
import NodeInfo from '../../services/data/node-info';
import NodeType from '../../services/data/node-type';
import { ApiService } from '../../services/api.service';
import ImportantFeatures from '../../services/data/important-features';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'expl-zs-node-info-list',
  standalone: true,
  imports: [DecimalPipe, PercentPipe, MatTableModule],
  templateUrl: './node-info-list.component.html',
  host: { class: 'flex flex-col gap-2' },
})
export class NodeInfoListComponent implements OnInit {
  prediction = input<Prediction>();
  explanation = input<Explanation>();
  selectedNode = input.required<GraphNode>();
  importantFeatures = signal<ImportantFeatures | undefined>(undefined);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getImportantFeatures().subscribe(value => this.importantFeatures.set(value));
  }

  public displayedColumns = computed(() => {
    const explanation = this.explanation();
    const cols = ['attr', 'value'];
    if (explanation) {
      cols.push('importance');
    }
    return cols;
  });

  public selectedNodeImportance = computed(() => {
    const selectedNode = this.selectedNode();
    const prediction = this.prediction();
    const explanation = this.explanation();
    if (!selectedNode || !prediction || !explanation) {
      return;
    }
    return getNodeImportance(selectedNode, prediction, explanation);
  });

  public selectedNodeInfoFields = computed(() => {
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return [];
    }
    let nodeInfo = structuredClone(selectedNode.nodeInfo);
    const importantFeatures = this.importantFeatures();
    if (!nodeInfo || !importantFeatures) {
      return [];
    }
    if ('planParameters' in nodeInfo) {
      nodeInfo = Object.assign(nodeInfo, nodeInfo['planParameters']) as NodeInfo;
      delete nodeInfo['planParameters'];
    }
    if ('columnStats' in nodeInfo) {
      const colStats = structuredClone(nodeInfo['columnStats']);
      delete colStats['nodeType'];
      nodeInfo = Object.assign(nodeInfo, colStats) as NodeInfo;
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

    const explanation = this.explanation();
    if (!explanation || !(selectedNode.nodeId in explanation.featureImportance)) {
      values.sort((x, y) => (x.isFeature == y.isFeature ? 0 : x.isFeature ? 1 : -1));
      return values;
    }
    const importance = explanation.featureImportance[selectedNode.nodeId];
    const valuesWithImportance = values.map(v => ({
      name: v.name,
      value: v.value,
      isFeature: v.isFeature,
      importance: v.name in importance ? importance[v.name] : undefined,
    }));

    valuesWithImportance.sort((v1, v2) => {
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
      return value2 - value1;
    });
    return valuesWithImportance;
  });
}
