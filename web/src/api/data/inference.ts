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
  baseNodeDepth = 'BaseExplainerNodeDepth',
  gradient = 'GradientExplainer',
  guidedBackpropagation = 'GuidedBPExplainer',
  gnnExplainer = 'GNNExplainer',
  gnnExplainerOnlyPlans = 'GNNExplainerOnlyPlans',
  differenceExplainer = 'DifferenceExplainer',
  differenceExplainerOnlyPlans = 'DifferenceExplainerOnlyPlans',
}

export const explainerTypeToDisplay = {
  [ExplainerType.baseRuntime]: 'Actual Runtime',
  [ExplainerType.baseCardinality]: 'Cardinality',
  [ExplainerType.baseNodeDepth]: 'Node Depth',
  [ExplainerType.gradient]: 'Gradient',
  [ExplainerType.guidedBackpropagation]: 'GuidedBackprop',
  [ExplainerType.gnnExplainer]: 'GNNExplainer',
  [ExplainerType.gnnExplainerOnlyPlans]: 'GNNExplainer (Only Operators)',
  [ExplainerType.differenceExplainer]: 'DiffMask',
  [ExplainerType.differenceExplainerOnlyPlans]: 'DiffMask (Only Operators)',
} satisfies Record<ExplainerType, string>;
