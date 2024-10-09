import { Component } from '@angular/core';
import { QueryListComponent } from './query-list/query-list.component';

@Component({
  selector: 'expl-zs-demo-page',
  standalone: true,
  imports: [QueryListComponent],
  templateUrl: './demo-page.component.html',
})
export class DemoPageComponent {}
