import os.path
from pathlib import Path
from typing import Type, TypeVar
from config import Settings
from ml.dependencies import MLHelper
from query.db import get_db
from sqlalchemy.orm import class_mapper
from pydantic import BaseModel as PydanticBaseModel
from query.models import ColumnStats, DatabaseStats, OutputColumn, Plan, PlanParameters, TableStats, RunKwargs, WorkloadRun, LogicalPredicate, FilterColumn
from zero_shot_learned_db.explanations.data_models.nodes import FilterColumn as PydanticFilterColumn, LogicalPredicate as PydanticLogicalPredicate, NodeType, Plan as PydanticPlan
from zero_shot_learned_db.explanations.data_models.workload_run import load_workload_run

T = TypeVar("T")


def create_db_model(model_type: Type[T], data: PydanticBaseModel, **kwargs):
    model_mapper = class_mapper(model_type)
    valid_fields = {k: v for k, v in data.model_dump().items() if k in model_mapper.attrs.keys() and not isinstance(v, list) and not isinstance(v, dict)}
    return model_type(**valid_fields, **kwargs)


def store_workload_queries_in_db(settings: Settings, ml: MLHelper):
    dataset_file = os.path.join(settings.ml.base_data_dir, settings.ml.dataset_file)
    json_workload_run = load_workload_run(dataset_file)

    db_workload_run = create_db_model(WorkloadRun, json_workload_run, file_name=Path(dataset_file).stem)
    run_kwargs = create_db_model(RunKwargs, json_workload_run.run_kwargs)
    db_workload_run.run_kwargs = run_kwargs

    db_stats = DatabaseStats()
    if json_workload_run.database_stats.run_kwargs is None or json_workload_run.database_stats.run_kwargs.hardware != run_kwargs.hardware:
        raise Exception("Unexpected value")
    db_stats.run_kwargs = run_kwargs
    for i, stat in enumerate(json_workload_run.database_stats.table_stats):
        db_stats.table_stats.append(create_db_model(TableStats, stat, id_in_run=i))
    for i, stat in enumerate(json_workload_run.database_stats.column_stats):
        db_stats.column_stats.append(create_db_model(ColumnStats, stat, id_in_run=i))
    db_workload_run.database_stats = db_stats

    for plan in json_workload_run.parsed_plans:
        db_workload_run.parsed_plans.append(create_plan_db_model(plan, db_stats))

    with next(get_db()) as db:
        db.add(db_workload_run)
        db.commit()


def create_plan_db_model(json_plan: PydanticPlan, db_stats: DatabaseStats):
    plan = create_db_model(Plan, json_plan)
    plan.plan_parameters = create_db_model(PlanParameters, json_plan.plan_parameters)
    for json_output_column in json_plan.plan_parameters.output_columns:
        output_column = create_db_model(OutputColumn, json_output_column)
        plan.plan_parameters.output_columns.append(output_column)
        for json_column in json_output_column.columns:
            output_column.columns.append(db_stats.column_stats[json_column])
    if json_plan.plan_parameters.filter_columns is not None:
        plan.plan_parameters.filter_columns = create_logical_node(json_plan.plan_parameters.filter_columns, db_stats)
    for json_child_plan in json_plan.children:
        plan.children.append(create_plan_db_model(json_child_plan, db_stats))
    return plan


def create_logical_node(json_node: PydanticLogicalPredicate | PydanticFilterColumn, db_stats: DatabaseStats):
    if json_node.node_type == NodeType.LOGICAL_PRED:
        logical_predicate = create_db_model(LogicalPredicate, json_node)
        for child in json_node.children:
            logical_predicate.children.append(create_logical_node(child, db_stats))
        return logical_predicate
    elif json_node.node_type == NodeType.FILTER_COLUMN:
        filter_column = create_db_model(FilterColumn, json_node)
        for child in json_node.children:
            filter_column.children.append(create_logical_node(child, db_stats))
        filter_column.column_stats = db_stats.column_stats[json_node.column]
        return filter_column
    else:
        raise Exception("Node should be either LogicalPredicate or FilterColumn")
