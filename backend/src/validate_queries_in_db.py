import os
from tqdm import tqdm
from config import Settings
from ml.dependencies import MLHelper, MLHelperOld
from ml.service import ExplainerType
from query.db import Session
from query.models import Dataset, Plan, WorkloadRun
import networkx as nx

from zero_shot_learned_db.explanations.load import ParsedPlan


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
        queries = db.query(Plan).filter(Plan.workload_run_id == workload[2], Plan.id_in_run.is_not(None)).all()
        queries: list[Plan] = sorted(queries, key=lambda x: x.id_in_run)
        base_explainer_old = ml_helper_old.get_explainer(ExplainerType.BASE)
        for plan_id in tqdm(range(len(ml_helper_old.parsed_plans))):
            plan = ParsedPlan(
                queries[plan_id].to_pydantic(),
                ml_helper.database_stats[queries[plan_id].workload_run_id],
                ml_helper.hyperparameters,
                ml_helper.feature_statistics,
            )
            plan_old = ml_helper_old.get_plan(plan_id)
            plan.prepare_plan_for_view()
            plan.prepare_plan_for_inference()
            assert len(plan.graph_nodes) == len(plan_old.graph_nodes)
            assert nx.is_isomorphic(plan_old.nx_graph, plan.nx_graph)
            plan_old_strs = [str(node) for node in plan_old.graph_nodes]
            for i in range(len(plan.graph_nodes)):
                assert str(plan.graph_nodes[i]) in plan_old_strs
            prediction = base_explainer.predict(plan)
            prediction_old = base_explainer_old.predict(plan_old)
            assert prediction.label == prediction_old.label
