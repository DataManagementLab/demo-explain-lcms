from typing import Annotated
from fastapi import APIRouter, Depends, Request
import httpx
from tqdm import tqdm

from evaluation.dependencies import EvaluationPlansLoader, evaluation_plans, get_evaluation_results_dir
from evaluation.schemas import CorrelationEvaluation, EvaluationPlansStats, MostImportantNodeEvaluationAllRespose, NodeImportanceEvaluation, NodeStat, TablesToScore, TablesToScoreEvaluationResponse
from evaluation.service import FidelityType, compute_fidelity, draw_correlation_evaluations, draw_cost_score, draw_fidelity_score, draw_scatter_node_importance, get_correlation_evaluation
from evaluation.utils import load_model_from_file, save_model_to_file
from ml.dependencies import get_base_explainer, get_explainer
from ml.service import ExplainerType
from zero_shot_learned_db.explanations.data_models.nodes import NodeType
from zero_shot_learned_db.explanations.evaluation import cost_accuracy_evaluation, evaluation_fidelity_minus, evaluation_fidelity_plus, most_important_node_evaluation, pearson_correlation_internal, spearman_correlation_inernal
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explanations.load import ParsedPlan


router = APIRouter(tags=["evaluation"], prefix="/evaluation")


@router.get("/stats", response_model=EvaluationPlansStats)
def evaluation_plans_stats(evaluation_plans_loader: Annotated[EvaluationPlansLoader, Depends()]):
    return EvaluationPlansStats(stats=evaluation_plans_loader.evaluation_plans_stats)


@router.get("/{explainer_type}/fidelity-plus", response_model=TablesToScoreEvaluationResponse)
def get_fidelity_plus_evaluation_all(
    explainer_type: ExplainerType,
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
    evaluation_plans: Annotated[list[ParsedPlan], Depends(evaluation_plans)],
    output_dir: Annotated[str, Depends(get_evaluation_results_dir)],
):
    return compute_fidelity(explainer_type, explainer, evaluation_plans, output_dir, evaluation_fidelity_plus, FidelityType.PLUS)


@router.get("/{explainer_type}/fidelity-minus", response_model=TablesToScoreEvaluationResponse)
def get_fidelity_minus_evaluation_all(
    explainer_type: ExplainerType,
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
    evaluation_plans: Annotated[list[ParsedPlan], Depends(evaluation_plans)],
    output_dir: Annotated[str, Depends(get_evaluation_results_dir)],
):
    return compute_fidelity(explainer_type, explainer, evaluation_plans, output_dir, evaluation_fidelity_minus, FidelityType.MINUS)


@router.get("/{explainer_type}/most-important-node", response_model=MostImportantNodeEvaluationAllRespose)
def get_most_important_node_evaluation_all(
    explainer_type: ExplainerType,
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
    evaluation_plans: Annotated[list[ParsedPlan], Depends(evaluation_plans)],
    output_dir: Annotated[str, Depends(get_evaluation_results_dir)],
):
    file_name = f"{output_dir}/most_important_node_{explainer_type}.json"
    response = load_model_from_file(MostImportantNodeEvaluationAllRespose, file_name)
    if response is not None:
        return response

    count = len(evaluation_plans)
    evaluations = [most_important_node_evaluation(explainer, plan) for plan in tqdm(evaluation_plans)]
    explained_nodes = [e.explained_node for e in evaluations]
    explained_nodes_stat = [
        NodeStat(
            node_name=node_name,
            fraction=len([n for n in explained_nodes if n == node_name]) / count,
        )
        for node_name in set(explained_nodes)
    ]
    explained_nodes_stat.sort(key=lambda n: n.fraction, reverse=True)
    response = MostImportantNodeEvaluationAllRespose(nodes=explained_nodes_stat)
    save_model_to_file(response, file_name)
    return response


@router.get("/{explainer_type}/cost", response_model=TablesToScoreEvaluationResponse)
def get_cost_evaluation_all(
    explainer_type: ExplainerType,
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
    evaluation_plans: Annotated[list[ParsedPlan], Depends(evaluation_plans)],
    output_dir: Annotated[str, Depends(get_evaluation_results_dir)],
):
    file_name = f"{output_dir}/cost_{explainer_type}.json"
    response = load_model_from_file(TablesToScoreEvaluationResponse, file_name)
    if response is not None:
        return response

    evaluations = [cost_accuracy_evaluation(explainer, plan) for plan in tqdm(evaluation_plans)]
    table_counts = list(set([e._parsed_plan.graph_nodes_stats[NodeType.TABLE] for e in evaluations]))
    table_counts.sort()
    scores: list[TablesToScore] = []
    for table_count in table_counts:
        table_count_evaluations = [e for e in evaluations if e._parsed_plan.graph_nodes_stats[NodeType.TABLE] == table_count]
        hits = sum([e.hits for e in table_count_evaluations])
        total = sum([e.compare_count for e in table_count_evaluations])
        scores.append(TablesToScore(table_count=table_count, score=hits / total))

    response = TablesToScoreEvaluationResponse(scores=scores)
    save_model_to_file(response, file_name)
    return response


@router.get("/{explainer_type}/node-importance", response_model=NodeImportanceEvaluation)
def get_node_importance_evaluation(
    explainer_type: ExplainerType,
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
    evaluation_plans: Annotated[list[ParsedPlan], Depends(evaluation_plans)],
    output_dir: Annotated[str, Depends(get_evaluation_results_dir)],
    base_explainer: Annotated[BaseExplainer, Depends(get_base_explainer)],
):
    file_name = f"{output_dir}/node_importance_{explainer_type}.json"
    response = load_model_from_file(NodeImportanceEvaluation, file_name)
    if response is not None:
        return response

    actual_importances = [base_explainer.explain(plan).node_importance for plan in tqdm(evaluation_plans)]
    node_importances = [explainer.explain(plan).node_importance for plan in tqdm(evaluation_plans)]
    table_counts = list(set([plan.graph_nodes_stats[NodeType.TABLE] for plan in evaluation_plans]))
    table_counts.sort()

    response = NodeImportanceEvaluation(
        node_importances=node_importances,
        pearson_correlation=get_correlation_evaluation(
            node_importances,
            actual_importances,
            evaluation_plans,
            pearson_correlation_internal,
            table_counts,
        ),
        spearman_correlation=get_correlation_evaluation(
            node_importances,
            actual_importances,
            evaluation_plans,
            spearman_correlation_inernal,
            table_counts,
        ),
    )
    save_model_to_file(response, file_name)
    return response


@router.get("/plots")
def get_fidelity_evaluation_all_plot(output_dir: Annotated[str, Depends(get_evaluation_results_dir)]):
    for fidelity_type in FidelityType:
        data_fidelity: dict[ExplainerType, list[TablesToScore]] = {}
        for explainer_type in ExplainerType:
            file_name = f"{output_dir}/fidelity_{fidelity_type}_{explainer_type}.json"
            data_fidelity[explainer_type] = load_model_from_file(TablesToScoreEvaluationResponse, file_name).scores
        draw_fidelity_score(data_fidelity, output_dir, fidelity_type)

    data_cost: dict[ExplainerType, list[TablesToScore]] = {}
    for explainer_type in ExplainerType:
        file_name = f"{output_dir}/cost_{explainer_type}.json"
        data_cost[explainer_type] = load_model_from_file(TablesToScoreEvaluationResponse, file_name).scores
    draw_cost_score(data_cost, output_dir)

    actual_importance = load_model_from_file(NodeImportanceEvaluation, f"{output_dir}/node_importance_{ExplainerType.BASE}.json")
    data_correlation_pearson: dict[ExplainerType, CorrelationEvaluation] = {ExplainerType.BASE: actual_importance.pearson_correlation}
    data_correlation_spearman: dict[ExplainerType, CorrelationEvaluation] = {ExplainerType.BASE: actual_importance.spearman_correlation}
    for explainer_type in ExplainerType:
        if explainer_type == ExplainerType.BASE:
            continue
        file_name = f"{output_dir}/node_importance_{explainer_type}.json"
        data = load_model_from_file(NodeImportanceEvaluation, file_name)
        draw_scatter_node_importance(data.node_importances, actual_importance.node_importances, explainer_type, output_dir)
        data_correlation_pearson[explainer_type] = data.pearson_correlation
        data_correlation_spearman[explainer_type] = data.spearman_correlation
    draw_correlation_evaluations(data_correlation_pearson, "Pearson correlation", output_dir)
    draw_correlation_evaluations(data_correlation_spearman, "Spearman correlation", output_dir)


@router.get("/run_all_evaluations")
def run_all_evaluations(request: Request):
    base_url = str(request.base_url) + "evaluation"
    client = httpx.Client(timeout=None, base_url=base_url)
    httpx.get(f"{base_url}/stats")
    for explainer_type in ExplainerType:
        client.get(f"/{explainer_type}/fidelity-plus")
        client.get(f"/{explainer_type}/fidelity-minus")
        client.get(f"/{explainer_type}/most-important-node")
        client.get(f"/{explainer_type}/cost")
        client.get(f"/{explainer_type}/node-importance")
    client.get("/plots")
