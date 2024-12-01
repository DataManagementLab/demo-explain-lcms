import { ExplanationBase, PredictionBase } from './inference';

export interface FidelityEvaluation {
  output: PredictionBase;
  explanation: ExplanationBase;
  maskedOutput: PredictionBase;
  score: number;
}

export interface CorrelationEvaluation {
  score: number;
  baseline: ExplanationBase;
  explanation: ExplanationBase;
}

export type CorrelationType =
  | 'pearson'
  | 'spearman'
  | 'pearson-cardinality'
  | 'spearman-cardinality';

export const correlationTypeToDisplay = new Map<CorrelationType, string>([
  ['pearson', 'Pearson runtime'],
  ['spearman', 'Spearman runtime'],
  ['pearson-cardinality', 'Pearson cardinality'],
  ['spearman-cardinality', 'Spearman cardinality'],
]);
