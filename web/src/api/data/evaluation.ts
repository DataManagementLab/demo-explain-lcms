import { ExplanationBase, PredictionBase } from './inference';

export interface ScoreEvaluation {
  score: number;
}

export interface FidelityEvaluation extends ScoreEvaluation {
  output: PredictionBase;
  explanation: ExplanationBase;
  maskedOutput: PredictionBase;
}

export const fidelityTypes = [
  'fidelity-plus',
  'fidelity-minus',
  'characterization-score',
] as const;

export type FidelityType = (typeof fidelityTypes)[number];

export const fidelityTypeToDisplay = {
  'fidelity-plus': 'Fidelity Plus',
  'fidelity-minus': 'Fidelity Minus',
  'characterization-score': 'Characterization Score',
} satisfies Record<FidelityType, string>;

export interface CorrelationEvaluation extends ScoreEvaluation {
  baseline: ExplanationBase;
  explanation: ExplanationBase;
}

export const correlationTypes = [
  'pearson',
  'spearman',
  'pearson-cardinality',
  'spearman-cardinality',
] as const;

export type CorrelationType = (typeof correlationTypes)[number];

export const correlationTypeToDisplay = {
  pearson: 'Pearson Runtime',
  spearman: 'Spearman Runtime',
  'pearson-cardinality': 'Pearson Cardinality',
  'spearman-cardinality': 'Spearman Cardinality',
} satisfies Record<CorrelationType, string>;

export type EvaluationType = FidelityType | CorrelationType;
export const evaluationTypeToDisplay = {
  ...fidelityTypeToDisplay,
  ...correlationTypeToDisplay,
};

export function isCorrelationType(str: string): str is CorrelationType {
  return (correlationTypes as readonly string[]).includes(str);
}

export function isFidelityType(str: string): str is FidelityType {
  return fidelityTypes.includes(str as FidelityType);
}

export const evaluationTypes = [...fidelityTypes, ...correlationTypes] as const;
