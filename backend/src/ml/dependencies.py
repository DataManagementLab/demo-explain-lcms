import os.path
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
from zero_shot_learned_db.explanations.load import get_label_norm_runtimes
from zero_shot_learned_db.explanations.model import prepare_model
from zero_shot_learned_db.models.zero_shot_models.zero_shot_model import ZeroShotModel


class MLHelper:
    hyperparameters: HyperParameters
    feature_statistics: FeatureStatistics
    model: ZeroShotModel
    settings: Settings
    database_stats: dict[int, PydanticDatabaseStats]

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
        self.model = prepare_model(
            self.hyperparameters,
            self.feature_statistics,
            label_norm,
            model_dir,
            settings.ml.zs_model_file_name,
        )

        self.database_stats = {}
        for db_stats in db.query(DatabaseStats).all():
            workload_run = db.query(WorkloadRun.id).filter(WorkloadRun.database_stats_id == db_stats.id).first()
            self.database_stats[workload_run[0]] = db_stats.to_pydantic()

    def _assert_loaded(self):
        assert self.model is not None

    def get_explainer(self, explainer_type: ExplainerType):
        self._assert_loaded()

        return explainers[explainer_type](self.model, log=self.settings.ml.explainers_log)


def get_explainer(explainer_type: ExplainerType, ml: Annotated[MLHelper, Depends()]):
    return ml.get_explainer(explainer_type)


def get_base_explainer(ml: Annotated[MLHelper, Depends()]):
    return ml.get_explainer(ExplainerType.BASE)
