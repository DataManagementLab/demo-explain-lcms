import { Routes } from '@angular/router';
import { DemoPageComponent } from './demo-page/demo-page.component';
import { HomePageComponent } from './home-page/home-page.component';
// import { EvaluationPageComponent } from './evaluation-page/evaluation-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'demo', component: DemoPageComponent },
  // { path: 'evaluation', component: EvaluationPageComponent },
];
