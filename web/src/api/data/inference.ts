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
  actual = 'BaseExplainer',
  gradient = 'GradientExplainer',
  guidedBackpropagation = 'GuidedBPExplainer',
  gnnExplainer = 'GNNExplainer',
}

export const explainerTypeToDisplay = new Map([
  [ExplainerType.actual, 'Base'],
  [ExplainerType.gradient, 'Gradient'],
  [ExplainerType.guidedBackpropagation, 'Guided Backpropagation'],
  [ExplainerType.gnnExplainer, 'GNNExplainer'],
]);
