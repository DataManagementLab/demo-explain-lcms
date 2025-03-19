from enum import StrEnum
import time
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column

from ml.dependencies import MLHelper
from query.db import db_depends
from query.dependecies import get_explainer_for_parsed_plan, get_parsed_plan, get_parsed_plan_for_inference, get_predictor, inference_mutex
from query.models import Dataset, Plan, PlanStats, WorkloadRun, ZeroShotModelConfig
from query.schemas import DatasetResponse, ExplanationResponse, FullQueryResponse, GraphNodeResponse, PredictionResponse, QueriesPageResponse, QueryResponse, WorkloadRunResponse
from query.service import get_workload_run_queries_count
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explanations.load import ParsedPlan
from pydantic.alias_generators import to_camel


router = APIRouter(tags=["query"])


@router.get("/datasets", response_model=list[DatasetResponse])
def get_datasets(db: db_depends):
    datasets: list[DatasetResponse] = []
    for dataset in db.query(Dataset).all():
        default_model = db.query(ZeroShotModelConfig).filter(ZeroShotModelConfig.dataset_id == dataset.id).first()
        datasets.append(
            DatasetResponse(
                id=dataset.id,
                name=dataset.name,
                default_zero_shot_model_id=default_model.id if default_model is not None else None,
            )
        )
    return datasets


@router.get("/datasets/{dataset_id}/workloads", response_model=list[WorkloadRunResponse])
def get_workloads(dataset_id: int, db: db_depends):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(422, f"Dataset with id == {dataset_id} was not found")
    runs = db.query(WorkloadRun).filter(WorkloadRun.dataset_id == dataset_id).all()
    return [
        WorkloadRunResponse(
            id=run.id,
            file_path=run.file_path,
            file_name=run.file_name,
            queries_count=get_workload_run_queries_count(run.id, db),
        )
        for run in runs
    ]


class OrderByArg(StrEnum):
    ID = "id"
    NODES = "nodes"
    PLANS = "plans"
    JOINS = "joins"
    TABLES = "tables"
    COLUMNS = "columns"
    PREDICATES = "predicates"
    RUNTIME = "runtime"


order_by_columns: dict[OrderByArg, Column] = {
    OrderByArg.ID: Plan.id_in_run,
    OrderByArg.RUNTIME: Plan.plan_runtime,
    OrderByArg.NODES: PlanStats.nodes,
    OrderByArg.PLANS: PlanStats.plans,
    OrderByArg.JOINS: PlanStats.joins,
    OrderByArg.TABLES: PlanStats.tables,
    OrderByArg.COLUMNS: PlanStats.columns,
    OrderByArg.PREDICATES: PlanStats.predicates,
}


@router.get("/workloads/{workload_id}/queries", response_model=QueriesPageResponse)
def get_workload_queries(workload_id: int, db: db_depends, offset: int = 0, limit: int = 20, order_by: OrderByArg = OrderByArg.ID, ascending: bool = True):
    workload_run = db.query(WorkloadRun).filter(WorkloadRun.id == workload_id).first()
    if workload_run is None:
        raise HTTPException(422, f"Workload with id == {workload_id} was not found")
    order_by_column = order_by_columns[order_by]
    if not ascending:
        order_by_column = order_by_column.desc()
    plans = db.query(Plan, PlanStats).join(Plan.plan_stats).filter(Plan.workload_run_id == workload_id, Plan.id_in_run.is_not(None)).order_by(order_by_column).offset(offset).limit(limit).tuples().all()
    return QueriesPageResponse(
        queries=[
            QueryResponse(
                id=plan[0].id,
                id_in_run=plan[0].id_in_run,
                plan_runtime=plan[0].plan_runtime,
                sql=plan[0].sql,
                query_stats=plan[1],
            )
            for plan in plans
        ],
        offset=offset,
        limit=limit,
        total_count=get_workload_run_queries_count(workload_run.id, db),
    )


@router.get("/queries/{query_id}", response_model=FullQueryResponse)
def get_query(parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan)]):
    response = FullQueryResponse(
        id=parsed_plan.id,
        id_in_run=parsed_plan.id_in_run,
        plan_runtime=parsed_plan.plan.plan_runtime,
        query_stats=parsed_plan.graph_nodes_stats,
        dot_graph=parsed_plan.get_dot(),
        graph_nodes=[
            GraphNodeResponse(
                node_id=n.id_in_nx_graph,
                label=n.node.get_label(),
                node_info=n.node,
            )
            for n in parsed_plan.graph_nodes
        ],
        sql=parsed_plan.plan.sql,
    )

    return response


@router.get("/queries/{query_id}/prediction", response_model=PredictionResponse)
def get_prediction(
    parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan_for_inference)],
    base_explainer: Annotated[BaseExplainer, Depends(get_predictor)],
    inference_mutex: Annotated[None, Depends(inference_mutex)],
):
    start = time.time()
    prediction = base_explainer.predict(parsed_plan)
    return PredictionResponse(
        **prediction.model_dump(),
        execution_time=time.time() - start,
    )


@router.get("/queries/{query_id}/explanation/{explainer_type}", response_model=ExplanationResponse)
def get_explanation(
    parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan_for_inference)],
    explainer: Annotated[BaseExplainer, Depends(get_explainer_for_parsed_plan)],
    inference_mutex: Annotated[None, Depends(inference_mutex)],
):
    start = time.time()
    explanation = explainer.explain(parsed_plan)
    return ExplanationResponse(
        **explanation.model_dump(),
        execution_time=time.time() - start,
    )


@router.get("/general/features", response_model=list[str])
def get_features(ml: Annotated[MLHelper, Depends()]):
    features = [to_camel(feature) for feature_list in ml.hyperparameters.node_type_featurization.values() for feature in feature_list]
    return features
