import os
from tqdm import tqdm
from config import Settings
from ml.dependencies import MLHelper, MLHelperOld
from ml.service import ExplainerType
from query.db import Session
from query.dependecies import get_parsed_plan
from query.models import Dataset, Plan, WorkloadRun
import networkx as nx


def validate_queries_in_db(ml_helper: MLHelper, db: Session, settings: Settings):
    workloads = db.query(Dataset.directory, WorkloadRun.file_name, WorkloadRun.id).join(WorkloadRun.dataset)
    base_explainer = ml_helper.get_explainer(ExplainerType.BASE)

    for workload in workloads:
        ml_helper_old = MLHelperOld()
        ml_helper_old.load(settings, os.path.join(settings.ml.validation_base_dir, workload[0], workload[1]))

        print(f"Validating columns for {workload[0]}/{workload[1]}")
        for col_id, col in enumerate(ml_helper.database_stats[workload[2]].column_stats):
            col_old = ml_helper_old.workload_run.database_stats.column_stats[col_id]
            assert col.tablename == col_old.tablename
            assert col.attname == col_old.attname

        print(f"Validating tables for {workload[0]}/{workload[1]}")
        for table_id, table in enumerate(ml_helper.database_stats[workload[2]].table_stats):
            table_old = ml_helper_old.workload_run.database_stats.table_stats[table_id]
            assert table_old.relname == table.relname

        print(f"Validating queries for {workload[0]}/{workload[1]}")
        base_explainer_old = ml_helper_old.get_explainer(ExplainerType.BASE)
        for plan_id in tqdm(range(len(ml_helper_old.parsed_plans))):
            plan_id_db = db.query(Plan).filter(Plan.id_in_run == plan_id, Plan.workload_run_id == workload[2]).first().id
            plan_old = ml_helper_old.get_plan(plan_id)
            plan = get_parsed_plan(plan_id_db, db, ml_helper)
            plan.prepare_plan_for_inference()
            plan.prepare_plan_for_view()
            assert nx.is_isomorphic(plan_old.nx_graph, plan.nx_graph)
            for i in range(len(plan.graph_nodes)):
                assert i in plan_old.nx_graph.nodes
            prediction = base_explainer.predict(plan)
            prediction_old = base_explainer_old.predict(plan_old)
            assert abs(prediction.label - prediction_old.label) < 0.0001
