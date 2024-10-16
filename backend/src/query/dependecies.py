import threading
from typing import Annotated
from fastapi import Depends, HTTPException
from ml.dependencies import MLHelper
from query.db import db_depends
from query.models import Plan
from zero_shot_learned_db.explanations.load import ParsedPlan


def get_parsed_plan(query_id: int, db: db_depends, ml: Annotated[MLHelper, Depends()]):
    parsed_plan = ml.cache_get_plan(query_id)
    if parsed_plan is not None:
        return parsed_plan

    query = db.query(Plan).filter(Plan.id == query_id).first()
    if query is None or query.sql is None:
        raise HTTPException(422, f"Query with id == {query_id} was not found")

    plan = query.to_pydantic()
    parsed_plan = ParsedPlan(
        plan,
        ml.database_stats[query.workload_run_id],
        ml.hyperparameters,
        ml.feature_statistics,
    )
    parsed_plan.id = query.id
    parsed_plan.id_in_run = query.id_in_run
    parsed_plan.prepare_plan_for_view()

    ml.cache_store_plan(parsed_plan)

    return parsed_plan


def get_parsed_plan_for_inference(parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan)]):
    parsed_plan.prepare_plan_for_inference()
    return parsed_plan


_inference_mutex = threading.Lock()


def inference_mutex():
    try:
        _inference_mutex.acquire()
        yield
    finally:
        _inference_mutex.release()
