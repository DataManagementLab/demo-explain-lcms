from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status as status_code

from demo.schemas import ExplanationResponse, GraphNodeResponse, ImportantFeaturesResponse, PlanFullResponse, PlanResponse, PredictionResponse
from demo.service import round_explanation_values
from demo.utils import dict_keys_to_camel, list_values_to_camel
from ml.dependencies import MLHelper
from ml.service import ExplainerType


router = APIRouter(tags=["demo"])


@router.get("/plans", response_model=list[PlanResponse])
def get_plans(ml: Annotated[MLHelper, Depends()]):
    return [PlanResponse(id=id, graph_nodes_stats=plan.graph_nodes_stats) for id, plan in enumerate(ml.parsed_plans)]


@router.get("/plans/{plan_id}", response_model=PlanFullResponse)
def get_plan(plan_id: int, ml: Annotated[MLHelper, Depends()]):
    plan = ml.parsed_plans[plan_id]
    plan.prepare_plan_for_inference()
    return PlanFullResponse(
        id=plan_id,
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
def get_plan_prediction(plan_id: int, ml: Annotated[MLHelper, Depends()]):
    plan = ml.parsed_plans[plan_id]
    plan.prepare_plan_for_inference()
    explainer = ml.get_explainer(ExplainerType.BASE)
    return explainer.predict(plan)


@router.get("/plans/{plan_id}/explanation/{explainer_type}", response_model=ExplanationResponse)
def get_plan_explanation(plan_id: int, explainer_type: ExplainerType, ml: Annotated[MLHelper, Depends()]):
    if explainer_type == ExplainerType.BASE:
        raise HTTPException(status_code=status_code.HTTP_422_UNPROCESSABLE_ENTITY, detail="Base explainer is not allowed")

    plan = ml.parsed_plans[plan_id]
    plan.prepare_plan_for_inference()
    explainer = ml.get_explainer(explainer_type)
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
