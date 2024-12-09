from typing import Annotated
from fastapi import Depends, HTTPException
from tqdm import tqdm

from config import Settings, get_settings
from evaluation.models import EvaluationRun, PlanExplanation
from ml.dependencies import MLHelper
from ml.service import ExplainerType
from query.dependecies import InferenceMutex, get_parsed_plan
from query.models import Dataset, Plan, PlanStats, WorkloadRun
from query.db import db_depends
from evaluation.service import explainers_for_evaluation


class EvaluationRunComposed:
    evaluation_run: EvaluationRun
    explanations: list[tuple[Plan, list[PlanExplanation]]]


def store_and_get_explanations_for_workload(
    workload_id: int,
    db: db_depends,
    settings: Annotated[Settings, Depends(get_settings)],
    ml: Annotated[MLHelper, Depends()],
    run_new: bool = False,
):
    res = EvaluationRunComposed()
    res.explanations = []
    workload = db.query(WorkloadRun).join(Dataset).filter(WorkloadRun.id == workload_id).first()
    if workload is None:
        raise HTTPException(422, f"Workload {workload_id} does not exist")
    print(f"Start store explanation for workload {workload_id}")
    evaluation_run = db.query(EvaluationRun).filter(EvaluationRun.workload_id == workload_id).order_by(EvaluationRun.created_at.desc()).first()
    if evaluation_run is None or run_new:
        evaluation_run = EvaluationRun(workload_id=workload_id)
        db.add(evaluation_run)
        db.commit()
        db.refresh(evaluation_run)
    res.evaluation_run = evaluation_run
    existing_explanations = evaluation_run.plan_explanations
    for model in ml.concrete_models_for_datasets[workload.dataset.name]:
        for table_count in range(1, settings.eval.max_table_count + 1):
            print(f"Explaining plans with {table_count} tables with {model.name}")
            plans = db.query(Plan).join(Plan.plan_stats).filter(Plan.sql.is_not(None), Plan.workload_run_id == workload_id, PlanStats.tables == table_count).order_by(Plan.id_in_run).limit(settings.eval.max_plans_per_table_count).all()
            for plan in tqdm(plans):
                explanations: list[PlanExplanation] = []
                for explainer_type in ExplainerType:
                    if explainer_type not in explainers_for_evaluation:
                        continue
                    plan_explanation = next(filter(lambda x: x.explainer_type == explainer_type and x.plan_id == plan.id and x.model_name == model.name, existing_explanations), None)
                    if plan_explanation is None:
                        with InferenceMutex() as mutex:
                            explainer = ml.get_explainer(explainer_type, workload.dataset.name, model.name)
                            parsed_plan = get_parsed_plan(plan.id, db, ml, mutex)
                            parsed_plan.prepare_plan_for_inference()
                            explanation = explainer.explain(parsed_plan)
                        plan_explanation = PlanExplanation(
                            explainer_type=explainer_type,
                            plan_id=plan.id,
                            base_scores=[score.model_dump() for score in explanation.base_scores],
                            model_name=model.name,
                        )
                        evaluation_run.plan_explanations.append(plan_explanation)
                    explanations.append(plan_explanation)
                res.explanations.append((plan, explanations))
            db.commit()
    return res
