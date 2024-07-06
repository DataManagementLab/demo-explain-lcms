import Prediction from './prediction';

interface FidelityEvaluation {
  maskedOutput: Prediction;
  score: number;
}

export default FidelityEvaluation;
