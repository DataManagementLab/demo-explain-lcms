from custom_model import CustomModel


class TablesToScore(CustomModel):
    table_count: int
    score: float


class TablesToScoreEvaluationResponse(CustomModel):
    scores: list[TablesToScore]


class NodeStat(CustomModel):
    node_name: str
    fraction: float


class MostImportantNodeEvaluationAllRespose(CustomModel):
    nodes: list[NodeStat]


class PlanStats(CustomModel):
    plan_count: int
    hash_joins_count: int


class EvaluationPlansStats(CustomModel):
    stats: dict[int, PlanStats]


class CorrelationScore(CustomModel):
    table_count: int
    score: float


class CorrelationEvaluation(CustomModel):
    correlations: list[CorrelationScore]
    correlations_mean: list[CorrelationScore]
    correlations_mean_all: float


class NodeImportanceEvaluation(CustomModel):
    node_importances: list[dict[int, float]]
    pearson_correlation: CorrelationEvaluation
    spearman_correlation: CorrelationEvaluation


class ValidQueriesStats(CustomModel):
    model: str
    dataset: str
    queries_count_per_joins: dict[int, int]
    avg_qerror_per_joins: dict[int, float]
    queries_count: int
    avg_qerror: float


class DatasetQueriesStats(CustomModel):
    valid_queries: list[ValidQueriesStats]
    invalid_queries: list[str]
    queries_count: int
    avg_qerror: float
    queries_count_0: int
    avg_qerror_0: float
