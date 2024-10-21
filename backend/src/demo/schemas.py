# from pydantic import Field
# from pydantic.json_schema import SkipJsonSchema
from custom_model import CustomModel

from zero_shot_learned_db.explanations.evaluation import CostAccuracyEvaluation, CostEvaluation, MostImportantNodeEvaluation
import zero_shot_learned_db.explanations.data_models.nodes as base_models

# -----------------


# -----------------


class PlanResponse(CustomModel):
    id: int
    graph_nodes_stats: dict[base_models.NodeType, int]


# class PlanFullResponse(PlanResponse):
#     dot_graph: str
#     graph_nodes: list[GraphNodeResponse]
#     label: float


class ImportantFeaturesResponse(CustomModel):
    features: dict[base_models.NodeType, list[str]]


# class FidelityEvaluationResponse(CustomModel):
#     output: PredictionResponse
#     masked_output: PredictionResponse
#     relative_change: float
#     outputs_equal: bool
#     score: int


class MostImportantNodeEvaluationRespose(CustomModel, MostImportantNodeEvaluation):
    pass


class CostEvaluationResponse(CostEvaluation):
    pass


class CostAccuracyEvaluationResponse(CostAccuracyEvaluation):
    actual_costs: list[CostEvaluationResponse]
    explanation_costs: list[CostEvaluationResponse]


class CorrelationEvaluationResponse(CustomModel):
    pearson_correlation: float
    spearman_correlation: float
