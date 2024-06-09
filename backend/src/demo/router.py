from typing import Annotated
from fastapi import APIRouter, Depends

from demo.schemas import ExplanationResponse, GraphNodeResponse, ImportantFeaturesResponse, PlanFullResponse, PlanResponse, PredictionResponse
from demo.service import round_explanation_values
from demo.utils import dict_keys_to_camel, list_values_to_camel
from ml.dependencies import MLHelpers
from zero_shot_learned_db.explainers.explainers.gradient_explainer import GradientExplainer


router = APIRouter(tags=["demo"])


@router.get("/plans", response_model=list[PlanResponse])
def get_plans(ml: Annotated[MLHelpers, Depends()]):
    return [PlanResponse(id=id, graph_nodes_stats=plan.graph_nodes_stats) for id, plan in enumerate(ml.parsed_plans)]


@router.get("/plans/{plan_id}", response_model=PlanFullResponse)
def get_plan(plan_id: int, ml: Annotated[MLHelpers, Depends()]):
    plan = ml.parsed_plans[plan_id]
    plan.prepare_plan_for_inference()
    return PlanFullResponse(
        id=plan_id,
        graph_nodes_stats=plan.graph_nodes_stats,
        dot_graph=plan.get_dot(),
        graph_nodes=[GraphNodeResponse(node_id=n.id_in_nx_graph, node_info=n.node) for n in plan.graph_nodes],
        label=plan.plan.plan_runtime,
    )


@router.get("/plans/{plan_id}/prediction", response_model=PredictionResponse)
def get_plan_prediction(plan_id: int, ml: Annotated[MLHelpers, Depends()]):
    plan = ml.parsed_plans[plan_id]
    plan.prepare_plan_for_inference()
    return plan.get_prediction(ml.model)


@router.get("/plans/{plan_id}/explanation", response_model=ExplanationResponse)
def get_plan_explanation(plan_id: int, ml: Annotated[MLHelpers, Depends()]):
    plan = ml.parsed_plans[plan_id]
    plan.prepare_plan_for_inference()
    explainer = GradientExplainer(ml.model)
    explanation = explainer.explain(plan)
    for grad in explanation.feature_importance.values():
        dict_keys_to_camel(grad)
    round_explanation_values(explanation)
    return explanation


@router.get("/important-features", response_model=ImportantFeaturesResponse)
def get_important_features(ml: Annotated[MLHelpers, Depends()]):
    features = ml.hyperparameters.node_type_featurization.copy()
    # dict_keys_to_camel(features)
    for k in features:
        features[k] = list_values_to_camel(features[k])
    return ImportantFeaturesResponse(features=features)
