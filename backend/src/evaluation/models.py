from datetime import datetime
from enum import StrEnum
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
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
    base_scores: Mapped[list[dict[str, int]]] = mapped_column(JSONB)
    evaluations: Mapped[list["EvaluationScore"]] = relationship()

    plan_id: Mapped[int] = mapped_column(ForeignKey(Plan.id))
    evaluation_run_id: Mapped[int] = mapped_column(ForeignKey(EvaluationRun.id))


class EvaluationType(StrEnum):
    FIDELITY_PLUS = "fidelity_plus"
    FIDELITY_MINUS = "fidelity_minus"
    PEARSON = "pearson"
    SPEARMAN = "spearman"


class EvaluationScore(Base):
    __tablename__ = "eval_scores"
    id: Mapped[int] = mapped_column(primary_key=True)

    explanation_id: Mapped[int] = mapped_column(ForeignKey(PlanExplanation.id))
    score: Mapped[float]
    evaluation_type: Mapped[str]
