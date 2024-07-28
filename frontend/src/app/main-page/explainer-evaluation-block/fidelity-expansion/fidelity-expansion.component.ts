import { Component, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import FidelityEvaluation from '../../../services/data/fidelity-evaluation';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { CnPipe } from '../../../pipes/cn.pipe';

@Component({
  selector: 'expl-zs-fidelity-expansion',
  standalone: true,
  imports: [MatExpansionModule, DecimalPipe, CnPipe, PercentPipe],
  templateUrl: './fidelity-expansion.component.html',
})
export class FidelityExpansionComponent {
  title = input.required<string>();
  fidelityEvaluation = input.required<FidelityEvaluation>();
}
