from typing import Annotated

from fastapi import Depends

from ml.dependencies import MLHelper


def get_plan(plan_id: int, ml: Annotated[MLHelper, Depends()]):
    plan = ml.parsed_plans[plan_id]
    plan.id = plan_id
    plan.prepare_plan_for_inference()
    return plan
