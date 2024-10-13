from query.db import Session
from query.models import Plan, PlanStats


def get_workload_run_queries_count(workload_run_id: int, db: Session):
    return db.query(Plan).filter(Plan.workload_run_id == workload_run_id).count()


def get_query_stats(plan_id: int, db: Session):
    return db.query(PlanStats).join(Plan.plan_stats).filter(Plan.id == plan_id).first()
