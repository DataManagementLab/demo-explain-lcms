import { DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, input, model } from '@angular/core';
import Explanation from '../../services/data/explanation';
import FullPlan from '../../services/data/full-plan';
import Prediction from '../../services/data/prediction';
import GraphNode from '../../services/data/graph-node';
import { getNodeImportance } from '../../utils/main-page-utils';
import { CnPipe } from '../../utils/cn.pipe';

@Component({
  selector: 'expl-zs-node-importance-list',
  standalone: true,
  imports: [DecimalPipe, PercentPipe, CnPipe],
  templateUrl: './node-importance-list.component.html',
  host: { class: 'flex flex-col gap-2 max-h-full overflow-y-auto' },
})
export class NodeImportanceListComponent {
  fullPlan = input.required<FullPlan>();
  prediction = input.required<Prediction>();
  explanation = input.required<Explanation>();
  selectedNode = model<GraphNode>();

  public nodeImportancesSorted = computed(() => {
    const res = this.fullPlan()
      .graphNodes.filter(node => node.nodeId in this.explanation().nodeImportance)
      .map(node => getNodeImportance(node, this.prediction(), this.explanation()));
    res.sort((x, y) => y.importance - x.importance);
    return res;
  });
}
