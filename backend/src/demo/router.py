from typing import Annotated
from fastapi import APIRouter, Depends

from demo.schemas import GraphNodeResponse, PlanFullResponse, PlanResponse, PredictionResponse
from ml.dependencies import MLHelpers


router = APIRouter(tags=["demo"])


@router.get("/plans", response_model=list[PlanResponse])
def get_plans(ml: Annotated[MLHelpers, Depends()]):
    return [PlanResponse(id=id, graph_nodes_stats=plan.graph_nodes_stats) for id, plan in enumerate(ml.parsed_plans)]


@router.get("/plan/{plan_id}", response_model=PlanFullResponse)
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


@router.get("/plan/{plan_id}/prediction", response_model=PredictionResponse)
def get_plan_prediction(plan_id: int, ml: Annotated[MLHelpers, Depends()]):
    plan = ml.parsed_plans[plan_id]
    plan.prepare_plan_for_inference()
    return plan.get_prediction(ml.model)
