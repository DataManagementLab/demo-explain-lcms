import time
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from ml.dependencies import MLHelper, get_base_explainer, get_explainer
from query.db import db_depends
from query.dependecies import get_parsed_plan, get_parsed_plan_for_inference, inference_mutex
from query.models import Dataset, Plan, WorkloadRun
from query.schemas import DatasetResponse, ExplanationResponse, FullQueryResponse, GraphNodeResponse, PredictionResponse, QueriesPageResponse, QueryResponse, WorkloadRunResponse
from query.service import get_query_stats, get_workload_run_queries_count
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explanations.load import ParsedPlan
from pydantic.alias_generators import to_camel


router = APIRouter(tags=["query"])


@router.get("/datasets", response_model=list[DatasetResponse])
def get_datasets(db: db_depends):
    return db.query(Dataset).all()


@router.get("/datasets/{dataset_id}/workloads", response_model=list[WorkloadRunResponse])
def get_workloads(dataset_id: int, db: db_depends):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(422, f"Dataset with id == {dataset_id} was not found")
    runs = db.query(WorkloadRun).filter(WorkloadRun.dataset_id == dataset_id).all()
    return [
        WorkloadRunResponse(
            id=run.id,
            file_name=run.file_name,
            queries_count=get_workload_run_queries_count(run.id, db),
        )
        for run in runs
    ]


@router.get("/workloads/{workload_id}/queries", response_model=QueriesPageResponse)
def get_workload_queries(workload_id: int, db: db_depends, offset: int = 0, limit: int = 20):
    workload_run = db.query(WorkloadRun).filter(WorkloadRun.id == workload_id).first()
    if workload_run is None:
        raise HTTPException(422, f"Workload with id == {workload_id} was not found")
    plans = db.query(Plan).filter(Plan.workload_run_id == workload_id, Plan.id_in_run.is_not(None)).order_by(Plan.id_in_run).offset(offset).limit(limit).all()
    return QueriesPageResponse(
        queries=[
            QueryResponse(
                id=plan.id,
                id_in_run=plan.id_in_run,
                plan_runtime=plan.plan_runtime,
                sql=plan.sql,
                query_stats=get_query_stats(plan.id, db),
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
    base_explainer: Annotated[BaseExplainer, Depends(get_base_explainer)],
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
    explainer: Annotated[BaseExplainer, Depends(get_explainer)],
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
