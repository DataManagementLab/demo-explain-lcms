from query.db import Session
from query.models import ColumnStats, LogicalPredicate, OutputColumn, Plan, PlanParameters

from zero_shot_learned_db.explanations.load import ParsedPlanStats


def get_workload_run_queries_count(workload_run_id: int, db: Session):
    return db.query(Plan).filter(Plan.workload_run_id == workload_run_id).count()


def get_query_stats(plan_id: int, db: Session):
    return ParsedPlanStats(
        tables=db.query(PlanParameters.table).join(Plan.plan_parameters).filter(Plan.top_plan_id == plan_id).distinct().count(),
        columns=db.query(ColumnStats.id).join(OutputColumn.columns).filter(OutputColumn.top_plan_id == plan_id).distinct().count(),
        predicates=db.query(LogicalPredicate.id).filter(LogicalPredicate.top_plan_id == plan_id).distinct().count(),
        plans=db.query(Plan.id).filter(Plan.top_plan_id == plan_id).distinct().count(),
    )
