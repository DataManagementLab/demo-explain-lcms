import { Component, computed, input, model, signal } from '@angular/core';
import Plan from '../../services/data/plan';
import { MatTableModule } from '@angular/material/table';
import { CnPipe } from '../../pipes/cn.pipe';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'expl-zs-plan-list',
  standalone: true,
  imports: [MatTableModule, CnPipe, MatPaginator],
  templateUrl: './plan-list.component.html',
})
export class PlanListComponent {
  plans = input<Plan[]>([]);
  columns = signal<string[]>([
    'id',
    'plans',
    'tables',
    'columns',
    'filters',
    'preds',
  ]);
  selectedPlan = model<Plan | undefined>();

  currentPage = signal<number>(0);
  pageSize = signal<number>(50);
  paginatedPlans = computed(() =>
    this.plans().slice(
      this.pageSize() * this.currentPage(),
      this.pageSize() * (this.currentPage() + 1),
    ),
  );
  itemsCount = computed(() => this.plans().length);

  onPage(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
  }
}
