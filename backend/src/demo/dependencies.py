from typing import Annotated

from fastapi import Depends, HTTPException, status as status_code

from ml.dependencies import MLHelper
from ml.service import ExplainerType


def get_plan(plan_id: int, ml: Annotated[MLHelper, Depends()]):
    if plan_id < 0 or plan_id >= len(ml.parsed_plans):
        raise HTTPException(status_code=status_code.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid plan id")
    plan = ml.parsed_plans[plan_id]
    plan.id = plan_id
    plan.prepare_plan_for_inference()
    return plan


def get_explainer(explainer_type: ExplainerType, ml: Annotated[MLHelper, Depends()]):
    if explainer_type == ExplainerType.BASE:
        raise HTTPException(status_code=status_code.HTTP_422_UNPROCESSABLE_ENTITY, detail="Base explainer is not supported")

    return ml.get_explainer(explainer_type)
