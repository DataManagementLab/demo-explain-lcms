import { ExplanationBase, PredictionBase } from './inference';

export interface ScoreEvaluation {
  score: number;
}

export interface FidelityEvaluation extends ScoreEvaluation {
  output: PredictionBase;
  explanation: ExplanationBase;
  maskedOutput: PredictionBase;
}

export type FidelityType =
  | 'fidelity-plus'
  | 'fidelity-minus'
  | 'characterization-score';
export const fidelityTypeToDisplay = {
  'fidelity-plus': 'Fidelity Plus',
  'fidelity-minus': 'Fidelity Minus',
  'characterization-score': 'Characterization Score',
} satisfies Record<FidelityType, string>;

export interface CorrelationEvaluation extends ScoreEvaluation {
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

export type EvaluationType = FidelityType | CorrelationType;
export const evaluationTypeToDisplay = {
  ...fidelityTypeToDisplay,
  ...correlationTypeToDisplay,
};
