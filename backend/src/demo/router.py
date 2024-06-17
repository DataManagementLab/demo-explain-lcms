from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status as status_code

from demo.dependencies import get_plan
from demo.schemas import CostAccuracyEvaluationResponse, ExplanationResponse, FidelityEvaluationResponse, GraphNodeResponse, ImportantFeaturesResponse, MostImportantNodeEvaluationRespose, PlanFullResponse, PlanResponse, PredictionResponse
from demo.service import round_explanation_values
from demo.utils import dict_keys_to_camel, list_values_to_camel
from ml.dependencies import MLHelper
from ml.service import ExplainerType
from zero_shot_learned_db.explainers.evaluation import cost_accuracy_evaluation, evaluation_fidelity_plus, most_important_node_evaluation
from zero_shot_learned_db.explainers.load import ParsedPlan


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
def get_plan_explanation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer_type: ExplainerType, ml: Annotated[MLHelper, Depends()]):
    if explainer_type == ExplainerType.BASE:
        raise HTTPException(status_code=status_code.HTTP_422_UNPROCESSABLE_ENTITY, detail="Base explainer is not supported")

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


@router.get("/plans/{plan_id}/explanation/{explainer_type}/evaluation/fidelity", response_model=FidelityEvaluationResponse)
def get_fidelity_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer_type: ExplainerType, ml: Annotated[MLHelper, Depends()]):
    if explainer_type == ExplainerType.BASE:
        raise HTTPException(status_code=status_code.HTTP_422_UNPROCESSABLE_ENTITY, detail="Base explainer is not supported")

    explainer = ml.get_explainer(explainer_type)
    return evaluation_fidelity_plus(explainer, plan)


@router.get("/plans/{plan_id}/explanation/{explainer_type}/evaluation/most-important-node", response_model=MostImportantNodeEvaluationRespose)
def get_most_important_node_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer_type: ExplainerType, ml: Annotated[MLHelper, Depends()]):
    if explainer_type == ExplainerType.BASE:
        raise HTTPException(status_code=status_code.HTTP_422_UNPROCESSABLE_ENTITY, detail="Base explainer is not supported")

    explainer = ml.get_explainer(explainer_type)
    return most_important_node_evaluation(explainer, plan)


@router.get("/plans/{plan_id}/explanation/{explainer_type}/evaluation/cost", response_model=CostAccuracyEvaluationResponse)
def get_cost_evaluation(plan: Annotated[ParsedPlan, Depends(get_plan)], explainer_type: ExplainerType, ml: Annotated[MLHelper, Depends()]):
    if explainer_type == ExplainerType.BASE:
        raise HTTPException(status_code=status_code.HTTP_422_UNPROCESSABLE_ENTITY, detail="Base explainer is not supported")

    explainer = ml.get_explainer(explainer_type)
    return cost_accuracy_evaluation(explainer, plan)
