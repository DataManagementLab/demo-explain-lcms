import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { EvaluationPageComponent } from './evaluation-page/evaluation-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent }, //
  { path: 'evaluation', component: EvaluationPageComponent },
];
