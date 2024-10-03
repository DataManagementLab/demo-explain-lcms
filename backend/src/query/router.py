from typing import Annotated
from fastapi import APIRouter, Depends

from ml.dependencies import MLHelper
from query.db import db_depends
from query.models import Plan, WorkloadRun
from query.schemas import FullWorkloadRunResponse, QueryResponse, WorkloadRunResponse
from query.service import get_query_stats, get_workload_run_queries_count


router = APIRouter(tags=["query"])


@router.get("/workloads", response_model=list[WorkloadRunResponse])
def get_workloads(db: db_depends):
    runs = db.query(WorkloadRun).all()
    return [
        WorkloadRunResponse(
            id=run.id,
            file_name=run.file_name,
            dataset_name=run.dataset_name,
            queries_count=get_workload_run_queries_count(run.id, db),
        )
        for run in runs
    ]


@router.get("/workloads/{workload_id}", response_model=FullWorkloadRunResponse)
def get_workload_by_id(workload_id: int, db: db_depends, ml: Annotated[MLHelper, Depends()], offset: int = 0, limit: int = 20):
    workload_run = db.query(WorkloadRun).filter(WorkloadRun.id == workload_id).first()
    plans = db.query(Plan).filter(Plan.workload_run_id == workload_id).offset(offset).limit(limit).all()
    return FullWorkloadRunResponse(
        id=workload_run.id,
        file_name=workload_run.file_name,
        dataset_name=workload_run.dataset_name,
        queries_count=get_workload_run_queries_count(workload_id, db),
        queries=[
            QueryResponse(
                id=plan.id,
                plan_runtime=plan.plan_runtime,
                sql=plan.sql,
                query_stats=get_query_stats(plan.id, db),
            )
            for plan in plans
        ],
    )
