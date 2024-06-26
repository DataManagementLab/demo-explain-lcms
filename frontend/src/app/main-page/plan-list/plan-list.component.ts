import { Component, input, model, signal } from '@angular/core';
import Plan from '../../services/data/plan';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'expl-zs-plan-list',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './plan-list.component.html',
  styleUrl: './plan-list.component.scss',
})
export class PlanListComponent {
  plans = input<Plan[]>([]);
  columns = signal<string[]>(['id', 'plans', 'tables', 'columns', 'filters', 'preds']);
  selectedPlan = model<Plan | undefined>();
}
