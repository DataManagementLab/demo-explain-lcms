from typing import Annotated
from fastapi import APIRouter, Depends

from evaluation.dependencies import store_and_get_explanations_for_workload
from ml.service import ExplainerType
from zero_shot_learned_db.explanations.data_models.explanation import Explanation


router = APIRouter(tags=["evaluation"], prefix="/evaluation")


@router.get("/workload/{workload_id}/run_all")
def run_all_for_workload(explanations: Annotated[dict[int, dict[ExplainerType, Explanation]], Depends(store_and_get_explanations_for_workload)]):
    pass
