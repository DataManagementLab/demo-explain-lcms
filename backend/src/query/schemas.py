from custom_model import CustomModel
from demo.schemas import GraphNodeResponse
from zero_shot_learned_db.explanations.load import ParsedPlanStats


class WorkloadRunResponse(CustomModel):
    id: int
    file_name: str
    queries_count: int


class QueryResponse(CustomModel):
    id: int
    plan_runtime: float
    sql: str
    query_stats: ParsedPlanStats


class FullQueryResponse(QueryResponse):
    dot_graph: str
    graph_nodes: list[GraphNodeResponse]


class DatasetResponse(CustomModel):
    id: int
    name: str
