import os.path
import time
from typing import Annotated
from fastapi import Depends
import numpy as np
import torch

from config import Settings
from ml.service import ExplainerType, explainers
from query.db import Session
from query.models import DatabaseStats, Plan, WorkloadRun
from zero_shot_learned_db.cross_db_benchmark.benchmark_tools.database import DatabaseSystem
from zero_shot_learned_db.explanations.data_models.hyperparameters import HyperParameters, load_hyperparameters
from zero_shot_learned_db.explanations.data_models.statistics import FeatureStatistics, load_statistics
from zero_shot_learned_db.explanations.data_models.workload_run import DatabaseStats as PydanticDatabaseStats
from zero_shot_learned_db.explanations.load import ParsedPlan, get_label_norm_runtimes
from zero_shot_learned_db.explanations.model import ZeroShotModelStorage, prepare_model


class MLHelper:
    hyperparameters: HyperParameters
    feature_statistics: FeatureStatistics
    model_storage: ZeroShotModelStorage
    settings: Settings
    database_stats: dict[int, PydanticDatabaseStats]
    plans_cache: dict[int, tuple[ParsedPlan, float]]

    def load(self, settings: Settings, db: Session):
        self.settings = settings
        statistics_file = os.path.join(settings.ml.base_data_dir, settings.ml.statistics_file)
        model_dir = os.path.join(settings.ml.base_data_dir, settings.ml.zs_model_dir)

        self.hyperparameters = load_hyperparameters(
            settings.ml.hyperparameters_file,
            database=DatabaseSystem.POSTGRES,
            device=settings.ml.device,
            batch_size=settings.ml.batch_size,
            seed=settings.ml.seed,
        )
        torch.manual_seed(self.hyperparameters.seed)
        np.random.seed(self.hyperparameters.seed)

        self.feature_statistics = load_statistics(statistics_file)
        label_norm = get_label_norm_runtimes([i[0] for i in db.query(Plan.plan_runtime).filter(Plan.sql.is_not(None)).all()], self.hyperparameters.final_mlp_kwargs.loss_class_name)
        model = prepare_model(
            self.hyperparameters,
            self.feature_statistics,
            label_norm,
            model_dir,
            settings.ml.zs_model_file_name,
        )
        self.model_storage = ZeroShotModelStorage(model)

        self.database_stats = {}
        for db_stats in db.query(DatabaseStats).all():
            workload_run = db.query(WorkloadRun.id).filter(WorkloadRun.database_stats_id == db_stats.id).first()
            self.database_stats[workload_run[0]] = db_stats.to_pydantic()

        self.plans_cache = {}

    def _assert_loaded(self):
        assert self.model_storage is not None

    def get_explainer(self, explainer_type: ExplainerType):
        self._assert_loaded()

        return explainers[explainer_type](self.model_storage, log=self.settings.ml.explainers_log)

    def cache_store_plan(self, plan: ParsedPlan):
        self.plans_cache[plan.id] = (plan, time.time())

        if len(self.plans_cache) > self.settings.ml.plans_cache_max_size:
            max_time = 0
            max_id = 0
            for id, (plan, t) in self.plans_cache.items():
                if t > max_time:
                    max_time = t
                    max_id = id
            self.plans_cache.pop(max_id)

    def cache_get_plan(self, plan_id: int):
        if plan_id not in self.plans_cache:
            return None
        plan = self.plans_cache[plan_id][0]
        self.cache_store_plan(plan)
        return plan


def get_explainer(explainer_type: ExplainerType, ml: Annotated[MLHelper, Depends()]):
    return ml.get_explainer(explainer_type)


def get_base_explainer(ml: Annotated[MLHelper, Depends()]):
    return ml.get_explainer(ExplainerType.BASE)
