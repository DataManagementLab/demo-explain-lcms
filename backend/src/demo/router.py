from statistics import mean
from typing import Annotated
from fastapi import APIRouter, Depends
from tqdm import tqdm

from demo.dependencies import get_evaluation_results_dir, get_explainer, get_plan
from demo.schemas import (
    CostAccuracyEvaluationResponse,
    ExplanationResponse,
    FidelityEvaluationResponse,
    GraphNodeResponse,
    ImportantFeaturesResponse,
    MostImportantNodeEvaluationAllRespose,
    MostImportantNodeEvaluationRespose,
    NodeStat,
    PlanFullResponse,
    PlanResponse,
    PredictionResponse,
    TablesToScore,
    TablesToScoreEvaluationResponse,
)
from demo.service import round_explanation_values
from demo.utils import dict_keys_to_camel, list_values_to_camel, load_model_from_file, save_model_to_file
from ml.dependencies import MLHelper
from ml.service import ExplainerType
from zero_shot_learned_db.explainers.evaluation import cost_accuracy_evaluation, evaluation_fidelity_plus, most_important_node_evaluation
from zero_shot_learned_db.explainers.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explainers.load import NodeType, ParsedPlan


router = APIRouter(tags=["demo"])


@router.get("/plans", response_model=list[PlanResponse])
def get_plans(ml: Annotated[MLHelper, Depends()]):
    return [PlanResponse(id=id, graph_nodes_stats=plan.graph_nodes_stats) for id, plan in enumerate(ml.parsed_plans)]


@router.get("/plans/{plan_id}", response_model=PlanFullResponse)
def get_plan_request(plan: Annotated[ParsedPlan, Depends(get_plan)]):
    return PlanFullResponse(
        id=plan.id,
        graph_nodes_stats=plan.graph_nodes_stats,
        dot_graph=plan.get_dot(),
        graph_nodes=[
            GraphNodeResponse(
                node_id=n.id_in_nx_graph,
                label=n.node.get_label(),
                node_info=n.node,
            )
            for n in plan.graph_nodes
        ],
        label=plan.plan.plan_runtime,
    )


@router.get("/plans/{plan_id}/prediction", response_model=PredictionResponse)
def get_plan_prediction(plan: Annotated[ParsedPlan, Depends(get_plan)], ml: Annotated[MLHelper, Depends()]):
    explainer = ml.get_explainer(ExplainerType.BASE)
    return explainer.predict(plan)


@router.get("/plans/{plan_id}/explanation/{explainer_type}", response_model=ExplanationResponse)
def get_plan_explanation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer: Annotated[BaseExplainer, Depends(get_explainer)]):
    explanation = explainer.explain(plan)
    for grad in explanation.feature_importance.values():
        dict_keys_to_camel(grad)
    round_explanation_values(explanation)
    return explanation


@router.get("/important-features", response_model=ImportantFeaturesResponse)
def get_important_features(ml: Annotated[MLHelper, Depends()]):
    features = ml.hyperparameters.node_type_featurization.copy()
    # dict_keys_to_camel(features)
    for k in features:
        features[k] = list_values_to_camel(features[k])
    return ImportantFeaturesResponse(features=features)


@router.get("/plans/{plan_id}/evaluation/{explainer_type}/fidelity", response_model=FidelityEvaluationResponse)
def get_fidelity_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer: Annotated[BaseExplainer, Depends(get_explainer)]):
    return evaluation_fidelity_plus(explainer, plan)


@router.get("/plans/{plan_id}/evaluation/{explainer_type}/most-important-node", response_model=MostImportantNodeEvaluationRespose)
def get_most_important_node_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer: Annotated[BaseExplainer, Depends(get_explainer)]):
    return most_important_node_evaluation(explainer, plan)


@router.get("/plans/{plan_id}/evaluation/{explainer_type}/cost", response_model=CostAccuracyEvaluationResponse)
def get_cost_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer: Annotated[BaseExplainer, Depends(get_explainer)]):
    return cost_accuracy_evaluation(explainer, plan)


@router.get("/evaluation/{explainer_type}/fidelity", response_model=TablesToScoreEvaluationResponse)
def get_fidelity_evaluation_all(explainer_type: ExplainerType, explainer: Annotated[BaseExplainer, Depends(get_explainer)], ml: Annotated[MLHelper, Depends()], dir: Annotated[str, Depends(get_evaluation_results_dir)]):
    file_name = dir + f"/fidelity_{explainer_type}.json"
    response = load_model_from_file(TablesToScoreEvaluationResponse, file_name)
    if response is not None:
        return response

    evaluations = [evaluation_fidelity_plus(explainer, get_plan(i, ml)) for i in tqdm(range(len(ml.parsed_plans)))]
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
def get_most_important_node_evaluation_all(explainer_type: ExplainerType, explainer: Annotated[BaseExplainer, Depends(get_explainer)], ml: Annotated[MLHelper, Depends()], dir: Annotated[str, Depends(get_evaluation_results_dir)]):
    file_name = dir + f"/most_important_node_{explainer_type}.json"
    response = load_model_from_file(MostImportantNodeEvaluationAllRespose, file_name)
    if response is not None:
        return response

    count = len(ml.parsed_plans)
    evaluations = [most_important_node_evaluation(explainer, get_plan(i, ml)) for i in tqdm(range(count))]
    actual_nodes = [e.actual_node for e in evaluations]
    actual_nodes_stat = [
        NodeStat(
            node_name=node_name,
            fraction=len([n for n in actual_nodes if n == node_name]) / count,
        )
        for node_name in set(actual_nodes)
    ]
    actual_nodes_stat.sort(key=lambda n: n.fraction, reverse=True)
    explained_nodes = [e.explained_node for e in evaluations]
    explained_nodes_stat = [
        NodeStat(
            node_name=node_name,
            fraction=len([n for n in explained_nodes if n == node_name]) / count,
        )
        for node_name in set(explained_nodes)
    ]
    explained_nodes_stat.sort(key=lambda n: n.fraction, reverse=True)
    response = MostImportantNodeEvaluationAllRespose(actual_nodes=actual_nodes_stat, explained_nodes=explained_nodes_stat)
    save_model_to_file(response, file_name)
    return response


@router.get("/evaluation/{explainer_type}/cost", response_model=TablesToScoreEvaluationResponse)
def get_cost_evaluation_all(explainer_type: ExplainerType, explainer: Annotated[BaseExplainer, Depends(get_explainer)], ml: Annotated[MLHelper, Depends()], dir: Annotated[str, Depends(get_evaluation_results_dir)]):
    file_name = dir + f"/cost_{explainer_type}.json"
    response = load_model_from_file(TablesToScoreEvaluationResponse, file_name)
    if response is not None:
        return response

    evaluations = [cost_accuracy_evaluation(explainer, get_plan(i, ml)) for i in tqdm(range(len(ml.parsed_plans)))]
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
