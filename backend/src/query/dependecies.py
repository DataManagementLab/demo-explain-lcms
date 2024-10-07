from typing import Annotated
from fastapi import Depends, HTTPException
from ml.dependencies import MLHelper
from query.db import db_depends
from query.models import Plan
from zero_shot_learned_db.explanations.load import ParsedPlan


def get_parsed_plan(query_id: int, db: db_depends, ml: Annotated[MLHelper, Depends()]):
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
    parsed_plan.id = query_id

    return parsed_plan
