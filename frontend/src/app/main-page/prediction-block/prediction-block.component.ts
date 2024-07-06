import { Component, input } from '@angular/core';
import Prediction from '../../services/data/prediction';
import { DecimalPipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'expl-zs-prediction-block',
  standalone: true,
  imports: [DecimalPipe, MatDividerModule],
  templateUrl: './prediction-block.component.html',
  host: { class: 'flex flex-col gap-4' },
})
export class PredictionBlockComponent {
  prediction = input.required<Prediction>();
}
