from custom_model import CustomModel
from query.schemas import ExplanationResponseBase, PredictionResponseBase


class FidelityEvaluationResponse(CustomModel):
    output: PredictionResponseBase
    explanation: ExplanationResponseBase
    masked_output: PredictionResponseBase
    relative_change: float
    outputs_equal: bool
    score: int


class MostImportantNodeEvaluationResponse(CustomModel):
    explained_node_id: int
    explanation: ExplanationResponseBase


class CorrelationEvaluationResponse(CustomModel):
    score: float
    baseline: ExplanationResponseBase
    explanation: ExplanationResponseBase
