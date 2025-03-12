import os.path
import time
from typing import Type, TypeVar

from tqdm import tqdm
from config import Settings
from saved_runs_models import SavedDataset, SavedRunsConfig
from utils import load_model_from_file
from query.db import get_db
from sqlalchemy.orm import class_mapper
from pydantic import BaseModel as PydanticBaseModel
from query.models import ColumnStats, DatabaseStats, Dataset, OutputColumn, Plan, PlanParameters, PlanStats, TableStats, RunKwargs, LogicalPredicate, FilterColumn, WorkloadRun
from zero_shot_learned_db.explanations.data_models.nodes import FilterColumn as PydanticFilterColumn, LogicalPredicate as PydanticLogicalPredicate, NodeType, Plan as PydanticPlan, TableStats as PydanticTableStats
from zero_shot_learned_db.explanations.data_models.workload_run import WorkloadRun as PydanticWorkloadRun, load_workload_run
from zero_shot_learned_db.explanations.load import ParsedPlan

T = TypeVar("T")


def create_db_model(model_type: Type[T], data: PydanticBaseModel, **kwargs):
    model_mapper = class_mapper(model_type)
    valid_fields = {k: v for k, v in data.model_dump().items() if k in model_mapper.attrs.keys() and not isinstance(v, list) and not isinstance(v, dict)}
    return model_type(**valid_fields, **kwargs)


class RawPlan(PydanticBaseModel):
    analyze_plans: list[list[list[str]]] | None
    sql: str


class RawRun(PydanticBaseModel):
    query_list: list[RawPlan]


class SQLSearchFeatures:
    filter_literals: list[str]
    tables: list[str]
    columns: list[str]
    runtimes: list[float]

    def __init__(self, plan: ParsedPlan):
        self.filter_literals = []
        self.tables = []
        self.runtimes = []

        for node in plan.graph_nodes:
            if node.node.node_type == NodeType.PLAN:
                plan: PydanticPlan = node.node
                self.runtimes.append(str(plan.plan_parameters.act_time))
            elif node.node.node_type == NodeType.TABLE:
                table: PydanticTableStats = node.node
                self.tables.append(table.relname)
            elif node.node.node_type == NodeType.FILTER_COLUMN:
                filter: PydanticFilterColumn = node.node
                if filter.literal != "::text":
                    literal = str(filter.literal)
                    if literal.endswith(".0"):
                        literal = literal[:-2]
                    self.filter_literals.append(literal)

    def check_sql(self, raw_plan: RawPlan):
        sql = raw_plan.sql.replace('"', "")
        analyze_plans = "".join([i[0] for i in raw_plan.analyze_plans[0]])

        return all([i in sql for i in self.filter_literals]) and all([i in sql for i in self.tables]) and all([i in analyze_plans for i in self.runtimes])


def store_all_workload_queries_in_db(settings: Settings):
    runs_config = load_model_from_file(SavedRunsConfig, settings.query.saved_runs_config_file)
    base_runs_dir = os.path.join(settings.ml.base_data_dir, settings.query.datasets_runs_dir)
    base_runs_raw_dir = os.path.join(settings.ml.base_data_dir, settings.query.datasets_runs_raw_dir)
    for saved_dataset in runs_config.datasets:
        for run_file_path, run_file_name in zip(saved_dataset.runs, saved_dataset.runs_names):
            with next(get_db()) as db:
                run = db.query(Dataset).join(WorkloadRun.dataset).filter(Dataset.directory == saved_dataset.directory, WorkloadRun.file_path == run_file_path).first()
                if run is not None:
                    continue

            run_file = os.path.join(base_runs_dir, saved_dataset.directory, run_file_path)
            raw_run_file = os.path.join(base_runs_raw_dir, saved_dataset.directory, run_file_path)
            print(f"Store Started {saved_dataset.name} for workload {run_file_name} at {run_file} and {raw_run_file}")
            start_time = time.time()
            store_workload_queries_in_db(load_workload_run(run_file), saved_dataset, run_file_path, run_file_name, load_model_from_file(RawRun, raw_run_file))
            store_time = time.time() - start_time
            print("Store Finished", saved_dataset.name, run_file_name, "in", "{0:.2f}".format(store_time) + "s")


def store_workload_queries_in_db(json_workload_run: PydanticWorkloadRun, saved_dataset: SavedDataset, run_file_path: str, run_file_name: str, raw_run: RawRun):
    with next(get_db()) as db:
        dataset = db.query(Dataset).filter(Dataset.directory == saved_dataset.directory).first()
    if dataset is None:
        dataset = Dataset(name=saved_dataset.name, directory=saved_dataset.directory)
    db_workload_run = create_db_model(WorkloadRun, json_workload_run, file_name=run_file_name, file_path=run_file_path)
    db_workload_run.dataset = dataset
    run_kwargs = create_db_model(RunKwargs, json_workload_run.run_kwargs)
    db_workload_run.run_kwargs = run_kwargs

    db_stats = DatabaseStats()
    if json_workload_run.database_stats.run_kwargs is None or json_workload_run.database_stats.run_kwargs.hardware != run_kwargs.hardware:
        raise Exception("Unexpected value")
    db_stats.run_kwargs = run_kwargs
    for i, stat in enumerate(json_workload_run.database_stats.table_stats):
        db_stats.table_stats.append(create_db_model(TableStats, stat, id_in_run=i))
    for i, stat in enumerate(json_workload_run.database_stats.column_stats):
        db_stats.column_stats.append(create_db_model(ColumnStats, stat, id_in_run=i, table=next(filter(lambda t: t.relname == stat.tablename, db_stats.table_stats))))
    db_workload_run.database_stats = db_stats

    raw_plans = [raw_plan for raw_plan in raw_run.query_list if raw_plan.analyze_plans is not None and len(raw_plan.analyze_plans) > 0]
    for i, plan in enumerate(tqdm(json_workload_run.parsed_plans)):
        db_plan = create_plan_db_model(plan, db_stats)

        db_plan.id_in_run = i
        parsed_plan = ParsedPlan(plan, json_workload_run.database_stats)
        db_plan.plan_stats = create_db_model(PlanStats, parsed_plan.graph_nodes_stats)

        sql_search = SQLSearchFeatures(parsed_plan)
        sql = next((i.sql for i in raw_plans if sql_search.check_sql(i)), None)
        if sql is None:
            continue

        db_plan.sql = sql
        db_workload_run.parsed_plans.append(db_plan)

    with next(get_db()) as db:
        db.add(db_workload_run)
        db.commit()


def create_plan_db_model(json_plan: PydanticPlan, db_stats: DatabaseStats, top_plan: Plan | None = None):
    plan = create_db_model(Plan, json_plan)
    if top_plan is None:
        top_plan = plan
    else:
        plan.top_plan = top_plan
    plan.plan_parameters = create_db_model(PlanParameters, json_plan.plan_parameters)
    for json_output_column in json_plan.plan_parameters.output_columns:
        output_column = create_db_model(OutputColumn, json_output_column)
        output_column.top_plan = top_plan
        plan.plan_parameters.output_columns.append(output_column)
        for json_column in json_output_column.columns:
            output_column.columns.append(db_stats.column_stats[json_column])
    if json_plan.plan_parameters.filter_columns is not None:
        plan.plan_parameters.filter_columns = create_logical_node(json_plan.plan_parameters.filter_columns, db_stats, top_plan)
    for json_child_plan in json_plan.children:
        plan.children.append(create_plan_db_model(json_child_plan, db_stats, top_plan))
    return plan


def create_logical_node(json_node: PydanticLogicalPredicate | PydanticFilterColumn, db_stats: DatabaseStats, top_plan: Plan):
    if json_node.node_type == NodeType.LOGICAL_PRED:
        logical_predicate = create_db_model(LogicalPredicate, json_node)
        logical_predicate.top_plan = top_plan
        for child in json_node.children:
            logical_predicate.children.append(create_logical_node(child, db_stats, top_plan))
        return logical_predicate
    elif json_node.node_type == NodeType.FILTER_COLUMN:
        filter_column = create_db_model(FilterColumn, json_node)
        filter_column.top_plan = top_plan
        filter_column.column_stats = db_stats.column_stats[json_node.column]
        literal = str(json_node.literal)
        if literal.endswith(".0"):
            literal = literal[:-2]
        filter_column.literal = literal
        return filter_column
    else:
        raise Exception("Node should be either LogicalPredicate or FilterColumn")
