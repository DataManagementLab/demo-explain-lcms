from custom_model import CustomModel
from demo.schemas import PlanResponse


class WorkloadRunResponse(CustomModel):
    id: int
    file_name: str
    dataset_name: str


class FullWorkloadRunResponse(WorkloadRunResponse):
    parsed_plans: list[PlanResponse]
