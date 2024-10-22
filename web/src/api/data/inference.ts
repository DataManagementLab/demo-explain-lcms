export interface Prediction {
  label: number;
  prediction: number;
  qerror: number;
  executionTime: number;
}

export interface NodeScore {
  nodeId: number;
  score: number;
}

export interface Explanation {
  baseScores: NodeScore[];
  scaledImportance: NodeScore[];
  executionTime: number;
}

export enum ExplainerType {
  actual = 'BaseExplainer',
  gradient = 'GradientExplainer',
  guidedBackpropagation = 'GuidedBPExplainer',
  gnnExplainer = 'GNNExplainer',
}
