import Prediction from './prediction';

interface FidelityEvaluation {
  maskedOutput: Prediction;
  score: number;
  relativeChange: number;
  outputsEqual: boolean;
}

export default FidelityEvaluation;
