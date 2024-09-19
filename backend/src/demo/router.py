from typing import Annotated
from fastapi import APIRouter, Depends

from demo.schemas import (
    CorrelationEvaluationResponse,
    CostAccuracyEvaluationResponse,
    ExplanationResponse,
    FidelityEvaluationResponse,
    GraphNodeResponse,
    ImportantFeaturesResponse,
    MostImportantNodeEvaluationRespose,
    PlanFullResponse,
    PlanResponse,
    PredictionResponse,
)
from demo.utils import list_values_to_camel
from ml.dependencies import MLHelper, get_base_explainer, get_explainer, get_plan
from ml.service import ExplainerType
from zero_shot_learned_db.explanations.evaluation import cost_accuracy_evaluation, evaluation_fidelity_minus, evaluation_fidelity_plus, most_important_node_evaluation, pearson_correlation, spearman_correlation
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explanations.load import ParsedPlan


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
    return explainer.explain(plan)


@router.get("/important-features", response_model=ImportantFeaturesResponse)
def get_important_features(ml: Annotated[MLHelper, Depends()]):
    features = ml.hyperparameters.node_type_featurization.copy()
    # dict_keys_to_camel(features)
    for k in features:
        features[k] = list_values_to_camel(features[k])
    return ImportantFeaturesResponse(features=features)


@router.get("/plans/{plan_id}/evaluation/{explainer_type}/fidelity_plus", response_model=FidelityEvaluationResponse)
def get_fidelity_plus_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer: Annotated[BaseExplainer, Depends(get_explainer)]):
    return evaluation_fidelity_plus(explainer, plan)


@router.get("/plans/{plan_id}/evaluation/{explainer_type}/fidelity_minus", response_model=FidelityEvaluationResponse)
def get_fidelity_minus_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer: Annotated[BaseExplainer, Depends(get_explainer)]):
    return evaluation_fidelity_minus(explainer, plan)


@router.get("/plans/{plan_id}/evaluation/{explainer_type}/most-important-node", response_model=MostImportantNodeEvaluationRespose)
def get_most_important_node_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer: Annotated[BaseExplainer, Depends(get_explainer)]):
    return most_important_node_evaluation(explainer, plan)


@router.get("/plans/{plan_id}/evaluation/{explainer_type}/cost", response_model=CostAccuracyEvaluationResponse)
def get_cost_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer: Annotated[BaseExplainer, Depends(get_explainer)]):
    return cost_accuracy_evaluation(explainer, plan)


@router.get("/plans/{plan_id}/evaluation/{explainer_type}/correlation-node-importance", response_model=CorrelationEvaluationResponse)
def get_correlation_evaluation(
    plan: Annotated[ParsedPlan, Depends(get_plan)],
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
    base_explainer: Annotated[BaseExplainer, Depends(get_base_explainer)],
):
    return CorrelationEvaluationResponse(
        pearson_correlation=pearson_correlation(explainer, base_explainer, plan),
        spearman_correlation=spearman_correlation(explainer, base_explainer, plan),
    )
