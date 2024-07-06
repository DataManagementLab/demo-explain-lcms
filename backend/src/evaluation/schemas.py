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
    actual_nodes: list[NodeStat]
    explained_nodes: list[NodeStat]
