import { Component } from '@angular/core';
import { MainComponent } from './main/main.component';

@Component({
  selector: 'expl-zs-root',
  standalone: true,
  imports: [MainComponent],
  template: '<expl-zs-main />',
  host: { class: 'h-full' },
})
export class AppComponent {}
