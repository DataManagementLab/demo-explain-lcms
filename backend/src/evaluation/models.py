from datetime import datetime
from enum import StrEnum
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from query.db import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship

from query.models import Plan, WorkloadRun


class EvaluationRun(Base):
    __tablename__ = "eval_runs"
    id: Mapped[int] = mapped_column(primary_key=True)

    workload_id: Mapped[int] = mapped_column(ForeignKey(WorkloadRun.id))
    created_at: Mapped[datetime] = mapped_column(default=datetime.now())

    plan_explanations: Mapped[list["PlanExplanation"]] = relationship()


class PlanExplanation(Base):
    __tablename__ = "eval_plan_explanations"
    id: Mapped[int] = mapped_column(primary_key=True)

    explainer_type: Mapped[str]
    base_scores: Mapped[list[dict[str, int]]] = mapped_column(JSONB)
    evaluations: Mapped[list["EvaluationScore"]] = relationship()
    model_name: Mapped[str]

    plan_id: Mapped[int] = mapped_column(ForeignKey(Plan.id))
    plan: Mapped[Plan] = relationship()
    evaluation_run_id: Mapped[int] = mapped_column(ForeignKey(EvaluationRun.id))


class EvaluationType(StrEnum):
    FIDELITY_PLUS = "fidelity_plus"
    FIDELITY_MINUS = "fidelity_minus"
    CHARACTERIZATION_SCORE = "characterization_score"
    PEARSON = "pearson"
    SPEARMAN = "spearman"
    PEARSON_CARDINALITY = "pearson-cardinality"
    SPEARMAN_CARDINALITY = "spearman-cardinality"
    PEARSON_NODE_DEPTH = "pearson-node-depth"
    SPEARMAN_NODE_DEPTH = "spearman-node-depth"


class EvaluationScore(Base):
    __tablename__ = "eval_scores"
    id: Mapped[int] = mapped_column(primary_key=True)

    explanation_id: Mapped[int] = mapped_column(ForeignKey(PlanExplanation.id))
    score: Mapped[float]
    evaluation_type: Mapped[str]


class EvalPrediction(Base):
    __tablename__ = "eval_predictions"
    id: Mapped[int] = mapped_column(primary_key=True)

    plan_id: Mapped[int] = mapped_column(ForeignKey(Plan.id))
    plan: Mapped[Plan] = relationship()
    model_name: Mapped[str]
    prediction: Mapped[float]
    qerror: Mapped[float]
