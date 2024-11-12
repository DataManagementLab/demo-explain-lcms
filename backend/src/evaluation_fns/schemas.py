from custom_model import CustomModel
from query.schemas import ExplanationResponseBase, PredictionResponseBase


class ScoreResponse(CustomModel):
    score: float


class FidelityEvaluationResponse(ScoreResponse):
    output: PredictionResponseBase
    explanation: ExplanationResponseBase
    masked_output: PredictionResponseBase


class MostImportantNodeEvaluationResponse(CustomModel):
    explained_node_id: int
    explanation: ExplanationResponseBase


class CorrelationEvaluationResponse(ScoreResponse):
    baseline: ExplanationResponseBase
    explanation: ExplanationResponseBase
