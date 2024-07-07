from pydantic import BaseModel


class EvaluationSettings(BaseModel):
    max_table_count: int = 5
    max_plans_per_table_count: int = 100
