from custom_model import CustomModel
from query.schemas_nodes import ColumnStats, FilterColumn, LogicalPredicate, OutputColumn, Plan, TableStats


class WorkloadRunResponse(CustomModel):
    id: int
    file_name: str
    queries_count: int


class ParsedPlanStatsResponse(CustomModel):
    tables: int
    columns: int
    plans: int
    joins: int
    predicates: int
    order_by: bool
    nodes: int


class QueryResponse(CustomModel):
    id: int
    id_in_run: int
    plan_runtime: float
    sql: str
    query_stats: ParsedPlanStatsResponse


class QueriesPageResponse(CustomModel):
    queries: list[QueryResponse]
    limit: int
    offset: int
    total_count: int


class GraphNodeResponse(CustomModel):
    node_id: int
    label: str
    node_info: Plan | FilterColumn | LogicalPredicate | TableStats | ColumnStats | OutputColumn


class FullQueryResponse(QueryResponse):
    dot_graph: str
    graph_nodes: list[GraphNodeResponse]


class DatasetResponse(CustomModel):
    id: int
    name: str


class PredictionResponseBase(CustomModel):
    prediction: float
    label: float
    qerror: float


class PredictionResponse(PredictionResponseBase):
    execution_time: float


class NodeScore(CustomModel):
    node_id: int
    score: float


class ExplanationResponseBase(CustomModel):
    base_scores: list[NodeScore]
    scaled_importance: list[NodeScore]


class ExplanationResponse(ExplanationResponseBase):
    execution_time: float
