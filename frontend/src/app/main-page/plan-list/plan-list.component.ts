import { Component, input, model, signal } from '@angular/core';
import Plan from '../../services/data/plan';
import { MatTableModule } from '@angular/material/table';
import { CnPipe } from '../../pipes/cn.pipe';

@Component({
  selector: 'expl-zs-plan-list',
  standalone: true,
  imports: [MatTableModule, CnPipe],
  templateUrl: './plan-list.component.html',
})
export class PlanListComponent {
  plans = input<Plan[]>([]);
  columns = signal<string[]>(['id', 'plans', 'tables', 'columns', 'filters', 'preds']);
  selectedPlan = model<Plan | undefined>();
}
