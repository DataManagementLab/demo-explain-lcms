import { Component, input } from '@angular/core';
import { NodeStat } from '../../services/data/most-important-node-evaluation';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'expl-zs-most-important-node-table',
  standalone: true,
  imports: [MatTableModule, MatProgressSpinnerModule],
  templateUrl: './most-important-node-table.component.html',
  styleUrl: './most-important-node-table.component.scss',
})
export class MostImportantNodeTableComponent {
  columns = ['nodeName', 'value'];
  tableData = input<NodeStat[] | undefined>(undefined);
  title = input<string>();
}
