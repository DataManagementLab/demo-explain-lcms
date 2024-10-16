export interface Prediction {
  label: number;
  prediction: number;
  qerror: number;
  executionTime: number;
}

export interface NodeImportance {
  nodeId: number;
  importance: number;
}

export interface Explanation {
  nodeImportance: NodeImportance[];
  executionTime: number;
}

export enum ExplainerType {
  actual = 'BaseExplainer',
  gradient = 'GradientExplainer',
  guidedBackpropagation = 'GuidedBPExplainer',
  gnnExplainer = 'GNNExplainer',
}
