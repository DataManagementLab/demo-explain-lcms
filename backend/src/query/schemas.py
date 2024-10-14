from custom_model import CustomModel
from demo.schemas import GraphNodeResponse


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


class FullQueryResponse(QueryResponse):
    dot_graph: str
    graph_nodes: list[GraphNodeResponse]


class DatasetResponse(CustomModel):
    id: int
    name: str
