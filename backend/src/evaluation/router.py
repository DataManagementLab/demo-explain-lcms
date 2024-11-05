from statistics import mean
from typing import Annotated
from fastapi import APIRouter, Depends, Request
from tqdm import tqdm

from config import Settings, get_settings
from evaluation.dependencies import EvaluationRunComposed, store_and_get_explanations_for_workload
from evaluation.models import EvaluationScore, EvaluationType
from evaluation.service import EvaluationScoreToDraw, draw_score_evaluation
from evaluation_fns.dependencies import EvaluationBaseParams
from evaluation_fns.router import fidelity_minus, fidelity_plus, pearson, spearman, pearson_cardinality, spearman_cardinality
from ml.dependencies import MLHelper, get_base_cardinality_explainer, get_base_explainer
from ml.service import ExplainerType
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
    base_cardinality_explainer: Annotated[BaseExplainer, Depends(get_base_cardinality_explainer)],
    evaluation_run: Annotated[EvaluationRunComposed, Depends(store_and_get_explanations_for_workload)],
):
    print(f"Running evaluation on {len(evaluation_run.explanations)} queries")

    score_evaluations: dict[EvaluationType, list[EvaluationScoreToDraw]] = {}
    for evaluation_type in evaluation_types:
        score_evaluations[evaluation_type] = []

    score_evaluation_fns = [
        (EvaluationType.FIDELITY_PLUS, fidelity_plus),
        (EvaluationType.FIDELITY_MINUS, fidelity_minus),
        (EvaluationType.PEARSON, pearson),
        (EvaluationType.SPEARMAN, spearman),
        (EvaluationType.PEARSON_CARDINALITY, pearson_cardinality),
        (EvaluationType.SPEARMAN_CARDINALITY, spearman_cardinality),
    ]

    existing_explanations = evaluation_run.evaluation_run.plan_explanations
    for plan, node_explanation in tqdm(evaluation_run.explanations):
        for explainer_type, explanation in node_explanation:
            plan_explanation = next(filter(lambda x: x.explainer_type == explainer_type and x.plan_id == plan.id, existing_explanations))
            for evaluation_type, fn in score_evaluation_fns:
                res = next(filter(lambda x: x.evaluation_type == evaluation_type, plan_explanation.evaluations), None)
                if res is None:
                    parsed_plan = get_parsed_plan(plan.id, db, ml)
                    parsed_plan.prepare_plan_for_inference()
                    base_params = EvaluationBaseParams(
                        parsed_plan=parsed_plan,
                        base_explainer=base_explainer,
                        base_cardinality_explainer=base_cardinality_explainer,
                        explanation=explanation,
                    )
                    res = fn(base_params)
                    score = EvaluationScore(score=res.score, evaluation_type=evaluation_type)
                    plan_explanation.evaluations.append(score)
                score_evaluations[evaluation_type].append(
                    EvaluationScoreToDraw(
                        score=res.score,
                        explainer_type=explainer_type,
                        join_count=plan.plan_stats.joins,
                    )
                )
    db.commit()

    aggregated_scores: dict[EvaluationType, dict[ExplainerType, list[EvaluationScoreToDraw]]] = {}
    for evaluation_type, scores in score_evaluations.items():
        explainer_types = set([i.explainer_type for i in scores])
        join_counts = set([i.join_count for i in scores])
        aggregated_scores[evaluation_type] = {}
        for explainer_type in explainer_types:
            aggregated_scores[evaluation_type][explainer_type] = []
            for join_count in join_counts:
                explainer_scores = [score.score for score in scores if score.explainer_type == explainer_type and score.join_count == join_count]
                aggregated_scores[evaluation_type][explainer_type].append(
                    EvaluationScoreToDraw(
                        score=mean(explainer_scores),
                        explainer_type=explainer_type,
                        join_count=join_count,
                    )
                )

    for evaluation_type, scores in aggregated_scores.items():
        draw_score_evaluation(scores, settings.demo.evaluation_results_dir, evaluation_type)
