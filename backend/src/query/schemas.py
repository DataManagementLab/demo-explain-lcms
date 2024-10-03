from custom_model import CustomModel


class WorkloadRunResponse(CustomModel):
    id: int
    file_name: str
    dataset_name: str
    queries_count: int


class QueryStats(CustomModel):
    tables: int
    columns: int
    plans: int
    predicates: int


class QueryResponse(CustomModel):
    id: int
    plan_runtime: float
    sql: str
    query_stats: QueryStats


class FullWorkloadRunResponse(WorkloadRunResponse):
    queries: list[QueryResponse]
