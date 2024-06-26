import { Component, input } from '@angular/core';
import Prediction from '../../services/data/prediction';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'expl-zs-prediction-block',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './prediction-block.component.html',
  styleUrl: './prediction-block.component.scss',
})
export class PredictionBlockComponent {
  prediction = input.required<Prediction>();
}
