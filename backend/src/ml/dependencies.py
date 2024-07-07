import os.path
from typing import Annotated
from fastapi import Depends, HTTPException, status as status_code
import numpy as np
import torch

from config import Settings
from ml.service import ExplainerType, explainers
from zero_shot_learned_db.cross_db_benchmark.benchmark_tools.database import DatabaseSystem
from zero_shot_learned_db.explainers.explain import prepare_model
from zero_shot_learned_db.explainers.load import FeatureStatistics, HyperParameters, ParsedPlan, WorkloadRun, get_label_norm, load_hyperparameters, load_statistics, read_run
from zero_shot_learned_db.models.zero_shot_models.zero_shot_model import ZeroShotModel


class MLHelper:
    hyperparameters: HyperParameters
    feature_statistics: FeatureStatistics
    workload_run: WorkloadRun
    model: ZeroShotModel
    parsed_plans: list[ParsedPlan]

    def load(self, settings: Settings):
        dataset_file = os.path.join(settings.ml.base_data_dir, settings.ml.dataset_file)
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
        self.workload_run = read_run(dataset_file)
        if settings.ml.limit_plans is not None:
            self.workload_run.parsed_plans = self.workload_run.parsed_plans[: settings.ml.limit_plans]
        label_norm = get_label_norm(self.workload_run.parsed_plans, self.hyperparameters.final_mlp_kwargs.loss_class_name)
        self.model = prepare_model(
            self.hyperparameters,
            self.feature_statistics,
            label_norm,
            model_dir,
            settings.ml.zs_model_file_name,
        )

        self.parsed_plans = [
            ParsedPlan(
                plan,
                self.workload_run.database_stats,
                self.hyperparameters,
                self.feature_statistics,
            )
            for plan in self.workload_run.parsed_plans
        ]
        for index, plan in enumerate(self.parsed_plans):
            plan.id = index
        print(f"Loaded {len(self.parsed_plans)} plans from {dataset_file}")

    def _assert_loaded(self):
        assert self.model is not None

    def get_explainer(self, explainer_type: ExplainerType):
        self._assert_loaded()

        return explainers[explainer_type](self.model)


def get_explainer(explainer_type: ExplainerType, ml: Annotated[MLHelper, Depends()]):
    return ml.get_explainer(explainer_type)


def get_plan(plan_id: int, ml: Annotated[MLHelper, Depends()]):
    if plan_id < 0 or plan_id >= len(ml.parsed_plans):
        raise HTTPException(status_code=status_code.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid plan id")
    plan = ml.parsed_plans[plan_id]
    plan.prepare_plan_for_inference()
    plan.prepare_plan_for_view()
    return plan
