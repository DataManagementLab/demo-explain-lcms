import { ExplanationBase, PredictionBase } from './inference';

export interface FidelityEvaluation {
  output: PredictionBase;
  explanation: ExplanationBase;
  maskedOutput: PredictionBase;
  relativeChange: number;
  outputsEqual: boolean;
  score: number;
}

export interface CorrelationEvaluation {
  score: number;
  baseline: ExplanationBase;
  explanation: ExplanationBase;
}
