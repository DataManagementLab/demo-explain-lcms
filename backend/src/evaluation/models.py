from datetime import datetime
from sqlalchemy import ForeignKey
from query.db import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship

from query.models import Plan


class EvaluationRun(Base):
    __tablename__ = "eval_runs"
    id: Mapped[int] = mapped_column(primary_key=True)

    workload_id: Mapped[int] = mapped_column(ForeignKey(Plan.id))
    created_at: Mapped[datetime] = mapped_column(default=datetime.now())

    plan_explanations: Mapped[list["PlanExplanation"]] = relationship()


class PlanExplanation(Base):
    __tablename__ = "eval_plan_explanations"
    id: Mapped[int] = mapped_column(primary_key=True)

    explainer_type: Mapped[str]
    base_scores: Mapped[list["NodeScore"]] = relationship()

    plan_id: Mapped[int] = mapped_column(ForeignKey(Plan.id))
    evaluation_run_id: Mapped[int] = mapped_column(ForeignKey(EvaluationRun.id))


class NodeScore(Base):
    __tablename__ = "eval_node_scores"
    id: Mapped[int] = mapped_column(primary_key=True)

    node_id: Mapped[int]
    score: Mapped[float]

    plan_id: Mapped[int] = mapped_column(ForeignKey(PlanExplanation.id))
