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

export enum ExplainerType {
  baseRuntime = 'BaseExplainer',
  baseCardinality = 'BaseExplainerCardinality',
  gradient = 'GradientExplainer',
  guidedBackpropagation = 'GuidedBPExplainer',
  gnnExplainer = 'GNNExplainer',
  gnnExplainerOnlyPlans = 'GNNExplainerOnlyPlans',
  differenceExplainer = 'DifferenceExplainer',
  differenceExplainerOnlyPlans = 'DifferenceExplainerOnlyPlans',
}

export const explainerTypeToDisplay = new Map([
  [ExplainerType.baseRuntime, 'Runtime importance'],
  [ExplainerType.baseCardinality, 'Cardinality importance'],
  [ExplainerType.gradient, 'Gradient'],
  [ExplainerType.guidedBackpropagation, 'Guided Backpropagation'],
  [ExplainerType.gnnExplainer, 'GNNExplainer'],
  [ExplainerType.gnnExplainerOnlyPlans, 'GNNExplainer (Only Plans)'],
  [ExplainerType.differenceExplainer, 'Difference'],
  [ExplainerType.differenceExplainerOnlyPlans, 'Difference (Only Plans)'],
]);
