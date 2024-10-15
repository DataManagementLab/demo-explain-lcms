export interface Prediction {
  label: number;
  prediction: number;
  qerror: number;
}

export interface NodeImportance {
  nodeId: number;
  importance: number;
}

export interface Explanation {
  nodeImportance: NodeImportance[];
}

export enum ExplainerType {
  actual = 'BaseExplainer',
  gradient = 'GradientExplainer',
  guidedBackpropagation = 'GuidedBPExplainer',
  gnnExplainer = 'GNNExplainer',
}
