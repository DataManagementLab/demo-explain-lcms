from statistics import mean
from typing import Annotated
from fastapi import APIRouter, Depends
from tqdm import tqdm

from evaluation.dependencies import EvaluationPlansLoader, evaluation_plans, get_evaluation_results_dir
from evaluation.schemas import EvaluationPlansStats, MostImportantNodeEvaluationAllRespose, NodeStat, TablesToScore, TablesToScoreEvaluationResponse
from evaluation.service import draw_cost_score, draw_fidelity_score, draw_table
from evaluation.utils import load_model_from_file, save_model_to_file
from ml.dependencies import get_explainer
from ml.service import ExplainerType
from zero_shot_learned_db.explanations.evaluation import cost_accuracy_evaluation, evaluation_fidelity_plus, most_important_node_evaluation
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explanations.load import NodeType, ParsedPlan


router = APIRouter(tags=["evaluation"], prefix="/evaluation")


@router.get("/stats", response_model=EvaluationPlansStats)
def evaluation_plans_stats(evaluation_plans_loader: Annotated[EvaluationPlansLoader, Depends()]):
    return EvaluationPlansStats(stats=evaluation_plans_loader.evaluation_plans_stats)


@router.get("/{explainer_type}/fidelity", response_model=TablesToScoreEvaluationResponse)
def get_fidelity_evaluation_all(
    explainer_type: ExplainerType,
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
    evaluation_plans: Annotated[list[ParsedPlan], Depends(evaluation_plans)],
    dir: Annotated[str, Depends(get_evaluation_results_dir)],
):
    file_name = f"{dir}/fidelity_{explainer_type}.json"
    response = load_model_from_file(TablesToScoreEvaluationResponse, file_name)
    if response is not None:
        return response

    evaluations = [evaluation_fidelity_plus(explainer, plan) for plan in tqdm(evaluation_plans)]
    table_counts = list(set([e._parsed_plan.graph_nodes_stats[NodeType.TABLE] for e in evaluations]))
    table_counts.sort()
    scores: list[TablesToScore] = []
    for table_count in table_counts:
        score = mean([e.score for e in evaluations if e._parsed_plan.graph_nodes_stats[NodeType.TABLE] == table_count])
        scores.append(TablesToScore(table_count=table_count, score=score))

    response = TablesToScoreEvaluationResponse(scores=scores)
    save_model_to_file(response, file_name)
    return response


@router.get("/evaluation/{explainer_type}/most-important-node", response_model=MostImportantNodeEvaluationAllRespose)
def get_most_important_node_evaluation_all(
    explainer_type: ExplainerType,
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
    evaluation_plans: Annotated[list[ParsedPlan], Depends(evaluation_plans)],
    dir: Annotated[str, Depends(get_evaluation_results_dir)],
):
    file_name = f"{dir}/most_important_node_{explainer_type}.json"
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


@router.get("/evaluation/{explainer_type}/cost", response_model=TablesToScoreEvaluationResponse)
def get_cost_evaluation_all(
    explainer_type: ExplainerType,
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
    evaluation_plans: Annotated[list[ParsedPlan], Depends(evaluation_plans)],
    dir: Annotated[str, Depends(get_evaluation_results_dir)],
):
    file_name = f"{dir}/cost_{explainer_type}.json"
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


@router.get("/plots")
def get_fidelity_evaluation_all_plot(
    dir: Annotated[str, Depends(get_evaluation_results_dir)],
    evaluation_plans_loader: Annotated[EvaluationPlansLoader, Depends()],
):
    data_fidelity: dict[ExplainerType, list[TablesToScore]] = {}
    for explainer_type in ExplainerType:
        file_name = f"{dir}/fidelity_{explainer_type}.json"
        data_fidelity[explainer_type] = load_model_from_file(TablesToScoreEvaluationResponse, file_name).scores
    draw_fidelity_score(data_fidelity, dir)

    data_cost: dict[ExplainerType, list[TablesToScore]] = {}
    for explainer_type in ExplainerType:
        file_name = f"{dir}/cost_{explainer_type}.json"
        data_cost[explainer_type] = load_model_from_file(TablesToScoreEvaluationResponse, file_name).scores
    draw_cost_score(data_cost, dir)

    draw_table(evaluation_plans_loader.evaluation_plans_stats, dir)
