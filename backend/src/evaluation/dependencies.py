from typing import Annotated
from fastapi import Depends
from tqdm import tqdm

from config import Settings, get_settings
from evaluation.models import EvaluationRun, NodeScore, PlanExplanation
from ml.dependencies import MLHelper, get_explainer
from ml.service import ExplainerType
from query.dependecies import InferenceMutex, get_parsed_plan
from query.models import Plan, PlanStats
from zero_shot_learned_db.explanations.data_models.explanation import Explanation, NodeScore as PydanticNodeScore
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from query.db import db_depends


class EvaluationRunComposed:
    evaluation_run: EvaluationRun
    explanations: list[tuple[Plan, list[tuple[ExplainerType, Explanation]]]]


def store_and_get_explanations_for_workload(
    workload_id: int,
    db: db_depends,
    settings: Annotated[Settings, Depends(get_settings)],
    ml: Annotated[MLHelper, Depends()],
    run_new: bool = False,
):
    res = EvaluationRunComposed()
    res.explanations = []
    print(f"Start store explanation for workload {workload_id}")
    evaluation_run = db.query(EvaluationRun).filter(EvaluationRun.workload_id == workload_id).order_by(EvaluationRun.created_at.desc()).first()
    if evaluation_run is None or run_new:
        evaluation_run = EvaluationRun(workload_id=workload_id)
    res.evaluation_run = evaluation_run
    explainers: dict[ExplainerType, BaseExplainer] = {}
    for explainer_type in ExplainerType:
        explainers[explainer_type] = get_explainer(explainer_type, ml)
    for table_count in range(1, settings.eval.max_table_count + 1):
        print(f"Explaining plans with {table_count} tables")
        plans = db.query(Plan).join(Plan.plan_stats).filter(Plan.sql.is_not(None), Plan.workload_run_id == workload_id, PlanStats.tables == table_count).order_by(Plan.id_in_run).limit(settings.eval.max_plans_per_table_count).all()
        for plan in tqdm(plans):
            explanations = []
            existing_explanations = db.query(PlanExplanation).filter(PlanExplanation.evaluation_run_id == evaluation_run.id, PlanExplanation.plan_id == plan.id).all()
            for explainer_type in ExplainerType:
                existing_explanation = next(filter(lambda x: x.explainer_type == explainer_type, existing_explanations), None)
                if existing_explanation is not None:
                    explanation = Explanation(
                        node_count=plan.plan_stats.nodes,
                        base_scores=[PydanticNodeScore(node_id=score.node_id, score=score.score) for score in existing_explanation.base_scores],
                    )
                else:
                    with InferenceMutex():
                        parsed_plan = get_parsed_plan(plan.id, db, ml)
                        parsed_plan.prepare_plan_for_inference()
                        explanation = explainers[explainer_type].explain(parsed_plan)
                    new_explanation = PlanExplanation(explainer_type=explainer_type, plan_id=plan.id)
                    for i in explanation.base_scores:
                        new_explanation.base_scores.append(NodeScore(node_id=i.node_id, score=i.score))
                    evaluation_run.plan_explanations.append(new_explanation)
                explanations.append((explainer_type, explanation))
            res.explanations.append((plan, explanations))
    db.add(evaluation_run)
    db.commit()
    db.refresh(evaluation_run)
    return res
