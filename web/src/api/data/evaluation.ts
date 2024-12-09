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
  | 'spearman-cardinality'
  | 'pearson-node-depth'
  | 'spearman-node-depth';

export const correlationTypeToDisplay = {
  pearson: 'Pearson Runtime',
  spearman: 'Spearman Runtime',
  'pearson-cardinality': 'Pearson Cardinality',
  'spearman-cardinality': 'Spearman Cardinality',
  'pearson-node-depth': 'Pearson Node Depth',
  'spearman-node-depth': 'Spearman Node Depth',
} satisfies Record<CorrelationType, string>;
