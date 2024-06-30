import { Component, input } from '@angular/core';
import { NodeStat } from '../../services/data/most-important-node-evaluation';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'expl-zs-most-important-node-table',
  standalone: true,
  imports: [MatTableModule, MatProgressSpinnerModule],
  templateUrl: './most-important-node-table.component.html',
  host: { class: 'flex flex-col gap-4 items-center' },
})
export class MostImportantNodeTableComponent {
  columns = ['nodeName', 'value'];
  tableData = input<NodeStat[] | undefined>(undefined);
  title = input<string>();
}
