import threading
from typing import Annotated
from fastapi import Depends, HTTPException
from ml.dependencies import MLHelper
from ml.service import ExplainerType
from query.db import db_depends
from query.models import Plan, WorkloadRun
from zero_shot_learned_db.explanations.load import ParsedPlan

_inference_mutex = threading.Lock()


def inference_mutex():
    try:
        _inference_mutex.acquire()
        yield
    finally:
        _inference_mutex.release()


class InferenceMutex:
    def __enter__(self):
        _inference_mutex.acquire()

    def __exit__(self, *args):
        _inference_mutex.release()


def get_parsed_plan(
    query_id: int,
    db: db_depends,
    ml: Annotated[MLHelper, Depends()],
    inference_mutex: Annotated[None, Depends(inference_mutex)],
):
    parsed_plan = ml.cache_get_plan(query_id)
    if parsed_plan is not None:
        return parsed_plan

    query = db.query(Plan).join(Plan.workload_run).join(WorkloadRun.dataset).filter(Plan.id == query_id).first()
    if query is None:
        raise HTTPException(422, f"Query with id == {query_id} was not found")

    plan = query.to_pydantic()
    parsed_plan = ParsedPlan(
        plan,
        ml.database_stats[query.workload_run_id],
        ml.hyperparameters,
        ml.feature_statistics,
        dataset_name=query.workload_run.dataset.name,
    )
    parsed_plan.id = query.id
    parsed_plan.id_in_run = query.id_in_run
    parsed_plan.prepare_plan_for_view()

    ml.cache_store_plan(parsed_plan)

    return parsed_plan


def get_parsed_plan_for_inference(parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan)]):
    parsed_plan.prepare_plan_for_inference()
    return parsed_plan


def get_explainer_for_parsed_plan(
    explainer_type: ExplainerType,
    ml: Annotated[MLHelper, Depends()],
    parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan_for_inference)],
):
    return ml.get_explainer(explainer_type, dataset_name=parsed_plan.dataset_name)


def get_explainer_optional_for_parsed_plan(
    ml: Annotated[MLHelper, Depends()],
    parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan_for_inference)],
    explainer_type: ExplainerType | None = None,
):
    return ml.get_explainer(explainer_type, dataset_name=parsed_plan.dataset_name) if explainer_type is not None else None


def get_predictor(
    ml: Annotated[MLHelper, Depends()],
    parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan_for_inference)],
):
    return ml.get_explainer(ExplainerType.BASE, dataset_name=parsed_plan.dataset_name)
