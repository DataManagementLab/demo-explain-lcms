import { Component, signal } from '@angular/core';
import { BrnSelectImports } from '@spartan-ng/ui-select-brain';
import { ApiService } from '~/app/services/api.service';
import Dataset from '~/app/services/data/datset';
import Workload from '~/app/services/data/workload';
import { HlmButtonDirective } from '~/components/ui-button-helm/src';
import { HlmSelectImports } from '~/components/ui-select-helm/src';
import {
  HlmCaptionComponent,
  HlmTableComponent,
  HlmTdComponent,
  HlmThComponent,
  HlmTrowComponent,
} from '~/components/ui-table-helm/src';

@Component({
  selector: 'expl-zs-query-list',
  standalone: true,
  imports: [
    HlmCaptionComponent,
    HlmTableComponent,
    HlmTdComponent,
    HlmThComponent,
    HlmTrowComponent,
    HlmButtonDirective,
    BrnSelectImports,
    HlmSelectImports,
  ],
  templateUrl: './query-list.component.html',
})
export class QueryListComponent {
  readonly pageSize = 20;

  datasets = signal<Dataset[] | undefined>(undefined);
  selectedDataset = signal<Dataset | undefined>(undefined);

  workloads = signal<Workload[] | undefined>(undefined);
  selectedWorkload = signal<Workload | undefined>(undefined);

  queries = signal<Workload[] | undefined>(undefined);
  page = signal<number>(0);

  constructor(private api: ApiService) {
    api.getDatasets().subscribe((value) => this.datasets.set(value));
  }
}
