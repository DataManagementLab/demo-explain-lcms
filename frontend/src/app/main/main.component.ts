import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'expl-zs-main',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  templateUrl: './main.component.html',
  host: { class: 'flex flex-col' },
})
export class MainComponent {}
