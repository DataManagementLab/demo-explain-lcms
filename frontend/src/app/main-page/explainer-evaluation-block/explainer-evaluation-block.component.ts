import { Component, input } from '@angular/core';
import FidelityEvaluation from '../../services/data/fidelity-evaluation';
import { FidelityExpansionComponent } from './fidelity-expansion/fidelity-expansion.component';
import { MatExpansionModule } from '@angular/material/expansion';
import CorrelationEvaluation from '../../services/data/correlation-evaluation';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'expl-zs-explainer-evaluation-block',
  standalone: true,
  imports: [FidelityExpansionComponent, MatExpansionModule, DecimalPipe],
  templateUrl: './explainer-evaluation-block.component.html',
  host: { class: 'flex flex-col gap-4 max-h-full overflow-y-auto py-2' },
})
export class ExplainerEvaluationBlockComponent {
  correlationEvaluation = input.required<CorrelationEvaluation>();
  fidelityPlusEvaluation = input.required<FidelityEvaluation>();
  fidelityMinusEvaluation = input.required<FidelityEvaluation>();
}
