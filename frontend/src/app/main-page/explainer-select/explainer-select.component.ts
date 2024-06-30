import { Component, model } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import ExplainerType from '../../services/data/explainer-type';

@Component({
  selector: 'expl-zs-explainer-select',
  standalone: true,
  imports: [MatRadioModule],
  templateUrl: './explainer-select.component.html',
})
export class ExplainerSelectComponent {
  explainerType = ExplainerType;
  selectedExplainer = model.required<ExplainerType>();
}
