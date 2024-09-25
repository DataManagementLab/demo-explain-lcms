from typing import Annotated
from fastapi import APIRouter, Depends

from ml.dependencies import MLHelper
from query.db import db_depends
from query.models import WorkloadRun
from query.schemas import FullWorkloadRunResponse, WorkloadRunResponse


router = APIRouter(tags=["query"])


@router.get("/workloads", response_model=list[WorkloadRunResponse])
def get_workloads(db: db_depends):
    return db.query(WorkloadRun).all()


@router.get("/workloads/{workload_id}", response_model=FullWorkloadRunResponse)
def get_workload_by_id(workload_id: int, db: db_depends, ml: Annotated[MLHelper, Depends()]):
    return db.query(WorkloadRun).filter(WorkloadRun.id == workload_id).first()
