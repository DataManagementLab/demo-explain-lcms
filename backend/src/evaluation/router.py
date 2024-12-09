from statistics import mean
from typing import Annotated
from fastapi import APIRouter, Depends
from tqdm import tqdm
import json

from config import Settings, get_settings
from evaluation.dependencies import EvaluationRunComposed, store_and_get_explanations_for_workload
from evaluation.models import EvaluationRun, EvaluationScore, EvaluationType
from evaluation.service import EvaluationScoreToDraw, draw_score_evaluation, draw_score_evaluations_threshold_trend
from evaluation_fns.dependencies import EvaluationBaseParams
from evaluation_fns.router import fidelity_minus, fidelity_plus, pearson, pearson_node_depth, spearman, pearson_cardinality, spearman_cardinality, spearman_node_depth
from ml.dependencies import MLHelper
from ml.service import ExplainerType
from query.dependecies import InferenceMutex, get_parsed_plan
from query.db import db_depends
from zero_shot_learned_db.explanations.data_models.explanation import Explanation, NodeScore
from zero_shot_learned_db.explanations.evaluation import evaluation_characterization_score, evaluation_fidelity_minus, evaluation_fidelity_plus

router = APIRouter(tags=["evaluation"], prefix="/evaluation")


score_evaluation_fns_global = [
    (EvaluationType.FIDELITY_PLUS, fidelity_plus),
    (EvaluationType.FIDELITY_MINUS, fidelity_minus),
    (EvaluationType.CHARACTERIZATION_SCORE, None),
    (EvaluationType.PEARSON, pearson),
    (EvaluationType.SPEARMAN, spearman),
    (EvaluationType.PEARSON_CARDINALITY, pearson_cardinality),
    (EvaluationType.SPEARMAN_CARDINALITY, spearman_cardinality),
    (EvaluationType.PEARSON_NODE_DEPTH, pearson_node_depth),
    (EvaluationType.SPEARMAN_NODE_DEPTH, spearman_node_depth),
]


@router.get("/workload/{workload_id}/run_all")
def run_all_for_workload(
    db: db_depends,
    settings: Annotated[Settings, Depends(get_settings)],
    ml: Annotated[MLHelper, Depends()],
    evaluation_run: Annotated[EvaluationRunComposed, Depends(store_and_get_explanations_for_workload)],
):
    def get_fidelity_evaluation_fn(fn, params: tuple[float, float, float]):
        def fn_internal(base_params: EvaluationBaseParams):
            return fn(base_params.base_explainer, base_params.explanation, base_params.parsed_plan, params[0], params[1], params[2], settings.eval.use_binary_fidelity)

        return fn_internal

    score_evaluation_fns = list(score_evaluation_fns_global)

    if settings.eval.evaluate_fidelity_params:
        # (rel_change_threshold, abs_change_threshold, cumulative_importance)
        fidelity_test_thresholds: tuple[list[float], list[float], list[float]] = (
            # rel_change_threshold
            # [0.01, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3],
            [1],
            # abs_change_threshold
            # [1, 2, 3, 4, 5, 6, 7, 8, None],
            # [2],
            [None],
            # cumulative_importance
            # [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.99],
            [0.99],
        )
        for i in fidelity_test_thresholds[0]:
            for j in fidelity_test_thresholds[1]:
                for k in fidelity_test_thresholds[2]:
                    t = (i, j, k)
                    score_evaluation_fns.append((f"{EvaluationType.FIDELITY_PLUS}|{json.dumps(t)}{'_b' if settings.eval.use_binary_fidelity else ''}", get_fidelity_evaluation_fn(evaluation_fidelity_plus, t)))
                    score_evaluation_fns.append((f"{EvaluationType.FIDELITY_MINUS}|{json.dumps(t)}{'_b' if settings.eval.use_binary_fidelity else ''}", get_fidelity_evaluation_fn(evaluation_fidelity_minus, t)))

    evaluation_types = [e[0] for e in score_evaluation_fns]

    print(f"Running evaluation on {len(evaluation_run.explanations)} explanations")

    score_evaluations: dict[EvaluationType, list[EvaluationScoreToDraw]] = {}
    for evaluation_type in evaluation_types:
        score_evaluations[evaluation_type] = []

    for plan, node_explanation in tqdm(evaluation_run.explanations):
        for plan_explanation in node_explanation:
            for evaluation_type, fn in score_evaluation_fns:
                res = next(filter(lambda x: x.evaluation_type == evaluation_type, plan_explanation.evaluations), None)
                if res is None:
                    with InferenceMutex() as mutex:
                        parsed_plan = get_parsed_plan(plan.id, db, ml, mutex)
                        parsed_plan.prepare_plan_for_inference()
                        if evaluation_type == EvaluationType.CHARACTERIZATION_SCORE:
                            fidelity_plus_score = next(filter(lambda x: x.evaluation_type == EvaluationType.FIDELITY_PLUS, plan_explanation.evaluations))
                            fidelity_minus_score = next(filter(lambda x: x.evaluation_type == EvaluationType.FIDELITY_MINUS, plan_explanation.evaluations))
                            res = evaluation_characterization_score(fidelity_plus_score.score, fidelity_minus_score.score, parsed_plan)
                            score = EvaluationScore(score=res.score, evaluation_type=evaluation_type)
                        else:
                            explanation = Explanation(
                                node_count=plan.plan_stats.nodes,
                                base_scores=[NodeScore(**score) for score in plan_explanation.base_scores],
                            )
                            base_params = EvaluationBaseParams(
                                parsed_plan=parsed_plan,
                                base_explainer=ml.get_explainer(ExplainerType.BASE, parsed_plan.dataset_name, plan_explanation.model_name),
                                ml=ml,
                                explanation=explanation,
                            )
                            res = fn(base_params)
                            score = EvaluationScore(score=res.score, evaluation_type=evaluation_type)
                        plan_explanation.evaluations.append(score)
                score_evaluations[evaluation_type].append(
                    EvaluationScoreToDraw(
                        score=res.score,
                        explainer_type=plan_explanation.explainer_type,
                        join_count=plan.plan_stats.joins,
                        model_name=plan_explanation.model_name,
                    )
                )
    db.commit()

    agg_scores = {
        evaluation_type: {
            model_name: {
                explainer_type: [
                    EvaluationScoreToDraw(
                        score=mean([score.score for score in scores if score.explainer_type == explainer_type and score.join_count == join_count and score.model_name == model_name]),
                        explainer_type=explainer_type,
                        join_count=join_count,
                        model_name=model_name,
                    )
                    for join_count in set([i.join_count for i in scores])
                ]
                for explainer_type in set([i.explainer_type for i in scores])
            }
            for model_name in set([i.model_name for i in scores])
        }
        for evaluation_type, scores in score_evaluations.items()
    }

    for evaluation_type, model_results in agg_scores.items():
        for model_name, explainer_results in model_results.items():
            draw_score_evaluation(explainer_results, settings.eval.results_dir, evaluation_type, model_name)

    # if settings.eval.evaluate_fidelity_params:
    #     model_name = list(agg_scores[EvaluationType.FIDELITY_PLUS].keys())[0]
    #     variants = [evaluation_type.split("|")[1] for evaluation_type in agg_scores if EvaluationType.FIDELITY_PLUS in evaluation_type and evaluation_type != EvaluationType.FIDELITY_PLUS]
    #     fidelity_plus_evaluations = [agg_scores[evaluation_type][model_name] for evaluation_type in agg_scores if EvaluationType.FIDELITY_PLUS in evaluation_type and evaluation_type != EvaluationType.FIDELITY_PLUS]
    #     fidelity_minus_evaluations = [agg_scores[evaluation_type][model_name] for evaluation_type in agg_scores if EvaluationType.FIDELITY_MINUS in evaluation_type and evaluation_type != EvaluationType.FIDELITY_MINUS]
    #     draw_score_evaluations_combined(fidelity_plus_evaluations, settings.eval.results_dir, EvaluationType.FIDELITY_PLUS, model_name, variants)
    #     draw_score_evaluations_combined(fidelity_minus_evaluations, settings.eval.results_dir, EvaluationType.FIDELITY_MINUS, model_name, variants)

    if settings.eval.evaluate_fidelity_params:

        def get_data_for_trend_evaluation(target_evaluation_type: EvaluationType):
            res: dict[ExplainerType, dict[EvaluationType, list[EvaluationScoreToDraw]]] = {}
            for evaluation_type, evaluation_type_scores in agg_scores.items():
                for model_name, model_scores in evaluation_type_scores.items():
                    for explainer_type, scores in model_scores.items():
                        if target_evaluation_type in evaluation_type and evaluation_type != target_evaluation_type:
                            if explainer_type not in res:
                                res[explainer_type] = {}
                            if evaluation_type in res[explainer_type]:
                                res[explainer_type][evaluation_type].extend(scores)
                            else:
                                res[explainer_type][evaluation_type] = list(scores)
            return res

        model_name = list(agg_scores[EvaluationType.FIDELITY_PLUS].keys())[0]
        draw_score_evaluations_threshold_trend(get_data_for_trend_evaluation(EvaluationType.FIDELITY_PLUS), settings.eval.results_dir, EvaluationType.FIDELITY_PLUS, model_name)
        draw_score_evaluations_threshold_trend(get_data_for_trend_evaluation(EvaluationType.FIDELITY_PLUS), settings.eval.results_dir, EvaluationType.FIDELITY_PLUS, model_name, filter_join_counts=0)
        draw_score_evaluations_threshold_trend(get_data_for_trend_evaluation(EvaluationType.FIDELITY_PLUS), settings.eval.results_dir, EvaluationType.FIDELITY_PLUS, model_name, filter_join_counts=2)
        draw_score_evaluations_threshold_trend(get_data_for_trend_evaluation(EvaluationType.FIDELITY_PLUS), settings.eval.results_dir, EvaluationType.FIDELITY_PLUS, model_name, filter_join_counts=4)
        draw_score_evaluations_threshold_trend(get_data_for_trend_evaluation(EvaluationType.FIDELITY_MINUS), settings.eval.results_dir, EvaluationType.FIDELITY_MINUS, model_name)
        draw_score_evaluations_threshold_trend(get_data_for_trend_evaluation(EvaluationType.FIDELITY_MINUS), settings.eval.results_dir, EvaluationType.FIDELITY_MINUS, model_name, filter_join_counts=0)
        draw_score_evaluations_threshold_trend(get_data_for_trend_evaluation(EvaluationType.FIDELITY_MINUS), settings.eval.results_dir, EvaluationType.FIDELITY_MINUS, model_name, filter_join_counts=2)
        draw_score_evaluations_threshold_trend(get_data_for_trend_evaluation(EvaluationType.FIDELITY_MINUS), settings.eval.results_dir, EvaluationType.FIDELITY_MINUS, model_name, filter_join_counts=4)


@router.get("/draw_plots_combined_different_datsets")
def draw_plots_combine_all_datasets(
    db: db_depends,
    settings: Annotated[Settings, Depends(get_settings)],
):
    score_evaluation_fns = list(score_evaluation_fns_global)
    evaluation_types = [e[0] for e in score_evaluation_fns]

    score_evaluations: dict[EvaluationType, list[EvaluationScoreToDraw]] = {}
    for evaluation_type in evaluation_types:
        score_evaluations[evaluation_type] = []

    evaluation_runs = db.query(EvaluationRun).all()
    latest_runs: dict[int, EvaluationRun] = {}

    for run in evaluation_runs:
        if run.workload_id not in latest_runs or run.created_at > latest_runs[run.workload_id].created_at:
            latest_runs[run.workload_id] = run

    explanations_count = 0
    for run in latest_runs.values():
        for explanation in tqdm(run.plan_explanations):
            if "_0" not in explanation.model_name:
                continue
            explanations_count += 1
            for evaluation_type, fn in score_evaluation_fns:
                evaluation = next(filter(lambda x: x.evaluation_type == evaluation_type, explanation.evaluations), None)
                score_evaluations[evaluation.evaluation_type].append(
                    EvaluationScoreToDraw(
                        score=evaluation.score,
                        explainer_type=explanation.explainer_type,
                        join_count=explanation.plan.plan_stats.joins,
                        model_name=explanation.model_name,
                    )
                )

    print(f"Combined score for {sum([len(i) for i in score_evaluations.values()])} evaluation scores and {explanations_count} explanations")
    agg_scores = {
        evaluation_type: {
            explainer_type: [
                EvaluationScoreToDraw(
                    score=mean([score.score for score in scores if score.explainer_type == explainer_type and score.join_count == join_count]),
                    explainer_type=explainer_type,
                    join_count=join_count,
                    model_name="all",
                )
                for join_count in set([i.join_count for i in scores])
            ]
            for explainer_type in set([i.explainer_type for i in scores])
        }
        for evaluation_type, scores in score_evaluations.items()
    }

    for evaluation_type, explainer_results in agg_scores.items():
        draw_score_evaluation(explainer_results, settings.eval.results_dir, evaluation_type, "all")
