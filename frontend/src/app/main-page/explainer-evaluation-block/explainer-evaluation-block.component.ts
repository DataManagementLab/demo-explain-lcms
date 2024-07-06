import { Component, input } from '@angular/core';
import FidelityEvaluation from '../../services/data/fidelity-evaluation';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'expl-zs-explainer-evaluation-block',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './explainer-evaluation-block.component.html',
  host: { class: 'flex flex-col gap-4' },
})
export class ExplainerEvaluationBlockComponent {
  fidelutyEvaluation = input.required<FidelityEvaluation>();
}
