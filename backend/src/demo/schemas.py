from pydantic import Field
from pydantic.json_schema import SkipJsonSchema
from custom_model import CustomModel

from zero_shot_learned_db.explanations.evaluation import CostAccuracyEvaluation, CostEvaluation, MostImportantNodeEvaluation
import zero_shot_learned_db.explanations.data_models.nodes as base_models

# -----------------


class ColumnStats(CustomModel, base_models.ColumnStats):
    pass


class TableStats(CustomModel, base_models.TableStats):
    pass


class OutputColumn(CustomModel, base_models.OutputColumn):
    columns: SkipJsonSchema[list[int]] = Field(default=[], exclude=True)


class LogicalPredicate(CustomModel, base_models.LogicalPredicate):
    children: SkipJsonSchema[list[base_models.LogicalPredicate | base_models.FilterColumn]] = Field(default=[], exclude=True)


class FilterColumn(CustomModel, base_models.FilterColumn):
    column_stats: ColumnStats
    children: SkipJsonSchema[list[base_models.FilterColumn]] = Field(default=[], exclude=True)


class PlanParameters(CustomModel, base_models.PlanParameters):
    table: SkipJsonSchema[int | None] = Field(default=None, exclude=True)
    output_columns: SkipJsonSchema[list[base_models.OutputColumn]] = Field(default=[], exclude=True)
    filter_columns: SkipJsonSchema[base_models.LogicalPredicate | base_models.FilterColumn | None] = Field(default=None, exclude=True)


class Plan(CustomModel, base_models.Plan):
    plan_parameters: PlanParameters
    children: SkipJsonSchema[list[base_models.Plan]] = Field(default=[], exclude=True)
    database_id: SkipJsonSchema[int] = Field(default=0, exclude=True)


# -----------------


class PlanResponse(CustomModel):
    id: int
    graph_nodes_stats: dict[base_models.NodeType, int]


class GraphNodeResponse(CustomModel):
    node_id: int
    label: str
    node_info: Plan | FilterColumn | LogicalPredicate | TableStats | ColumnStats | OutputColumn


class PlanFullResponse(PlanResponse):
    dot_graph: str
    graph_nodes: list[GraphNodeResponse]
    label: float


class PredictionResponse(CustomModel):
    prediction: float
    label: float
    qerror: float


class ExplanationResponse(CustomModel):
    feature_importance: dict[int, dict[str, float]]
    node_importance: dict[int, float]


class ImportantFeaturesResponse(CustomModel):
    features: dict[base_models.NodeType, list[str]]


class FidelityEvaluationResponse(CustomModel):
    normal_output: PredictionResponse
    masked_output: PredictionResponse
    score: float


class MostImportantNodeEvaluationRespose(CustomModel, MostImportantNodeEvaluation):
    pass


class CostEvaluationResponse(CostEvaluation):
    pass


class CostAccuracyEvaluationResponse(CostAccuracyEvaluation):
    actual_costs: list[CostEvaluationResponse]
    explanation_costs: list[CostEvaluationResponse]
