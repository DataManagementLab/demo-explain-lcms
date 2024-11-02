from typing import Annotated
from fastapi import APIRouter, Depends, Request
from tqdm import tqdm

from config import Settings, get_settings
from evaluation.dependencies import EvaluationRunComposed, store_and_get_explanations_for_workload
from evaluation.models import EvaluationScore, EvaluationType
from evaluation_fns.dependencies import EvaluationBaseParams
from evaluation_fns.router import fidelity_minus, fidelity_plus, pearson, spearman
from ml.dependencies import MLHelper, get_base_explainer
from query.dependecies import get_parsed_plan
from query.db import db_depends
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer

router = APIRouter(tags=["evaluation"], prefix="/evaluation")

evaluation_types = [e.value for e in EvaluationType]


@router.get("/workload/{workload_id}/run_all")
def run_all_for_workload(
    request: Request,
    db: db_depends,
    settings: Annotated[Settings, Depends(get_settings)],
    ml: Annotated[MLHelper, Depends()],
    base_explainer: Annotated[BaseExplainer, Depends(get_base_explainer)],
    evaluation_run: Annotated[EvaluationRunComposed, Depends(store_and_get_explanations_for_workload)],
):
    print(f"Running evaluation on {len(evaluation_run.explanations)} queries")
    table_count_range = range(1, settings.eval.max_table_count + 1)

    score_evaluations: dict[EvaluationType, dict[int, list[EvaluationScore]]] = {}
    for evaluation_type in evaluation_types:
        score_evaluations[evaluation_type] = {}
        for i in table_count_range:
            score_evaluations[evaluation_type][i] = []

    score_evaluation_fns = [
        (EvaluationType.FIDELITY_PLUS, fidelity_plus),
        (EvaluationType.FIDELITY_MINUS, fidelity_minus),
        (EvaluationType.PEARSON, pearson),
        (EvaluationType.SPEARMAN, spearman),
    ]

    existing_explanations = evaluation_run.evaluation_run.plan_explanations
    for plan, node_explanation in tqdm(evaluation_run.explanations):
        for explainer_type, explanation in node_explanation:
            plan_explanation = next(filter(lambda x: x.explainer_type == explainer_type, existing_explanations))
            for evaluluation_type, fn in score_evaluation_fns:
                res = next(filter(lambda x: x.type == evaluation_type, plan_explanation.evaluations), None)
                if res is None:
                    parsed_plan = get_parsed_plan(plan.id, db, ml)
                    parsed_plan.prepare_plan_for_inference()
                    base_params = EvaluationBaseParams(parsed_plan, base_explainer, explanation)
                    res = fn(base_params)
                    score = EvaluationScore(score=res.score, type=evaluation_type)
                    plan_explanation.evaluations.append(score)
                score_evaluations[evaluluation_type][plan.plan_stats.tables].append(res)
    db.commit()
