from typing import Annotated

from fastapi import Depends, HTTPException, status as status_code

from ml.dependencies import MLHelper


def get_plan(plan_id: int, ml: Annotated[MLHelper, Depends()]):
    if plan_id < 0 or plan_id >= len(ml.parsed_plans):
        raise HTTPException(status_code=status_code.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid plan id")
    plan = ml.parsed_plans[plan_id]
    plan.id = plan_id
    plan.prepare_plan_for_inference()
    return plan
