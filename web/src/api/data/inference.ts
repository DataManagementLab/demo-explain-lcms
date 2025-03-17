export interface PredictionBase {
  label: number;
  prediction: number;
  qerror: number;
}

export interface Prediction extends PredictionBase {
  executionTime: number;
}

export interface NodeScore {
  nodeId: number;
  score: number;
}

export interface ExplanationBase {
  baseScores: NodeScore[];
  scaledImportance: NodeScore[];
}

export interface Explanation extends ExplanationBase {
  executionTime: number;
}

export const explainerTypes = [
  'BaseExplainer',
  'BaseExplainerCardinality',
  'GradientExplainer',
  'GuidedBPExplainer',
  'GNNExplainer',
  'GNNExplainerOnlyPlans',
  'DifferenceExplainer',
  'DifferenceExplainerOnlyPlans',
] as const;

export type ExplainerType = (typeof explainerTypes)[number];

export const explainerTypeToDisplay = {
  BaseExplainer: 'Actual Runtime',
  BaseExplainerCardinality: 'Actual Cardinality',
  GradientExplainer: 'SensitivityAnalysis',
  GuidedBPExplainer: 'GuidedBackprop',
  GNNExplainer: 'GNNExplainer',
  GNNExplainerOnlyPlans: 'GNNExplainer (Only Operators)',
  DifferenceExplainer: 'DiffMask',
  DifferenceExplainerOnlyPlans: 'DiffMask (Only Operators)',
} satisfies Record<ExplainerType, string>;

export function isExplainerType(str: string): str is ExplainerType {
  return explainerTypes.includes(str as ExplainerType);
}
