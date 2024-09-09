import os
import os.path
from typing import Annotated
from fastapi import Depends, HTTPException
from tqdm import tqdm

from config import Settings, get_settings
from evaluation.schemas import PlanStats
from evaluation.service import get_hash_joins_count
from ml.dependencies import MLHelper
from ml.service import ExplainerType
from zero_shot_learned_db.explanations.data_models.nodes import NodeType
from zero_shot_learned_db.explanations.load import ParsedPlan


def get_evaluation_results_dir(config: Annotated[Settings, Depends(get_settings)]):
    if not os.path.exists(config.demo.evaluation_results_dir):
        os.mkdir(config.demo.evaluation_results_dir)
    return config.demo.evaluation_results_dir


class EvaluationPlansLoader:
    ml: MLHelper
    evaluation_plans: list[ParsedPlan]
    are_plans_prepared: bool = False
    are_plans_explained: bool = False

    evaluation_plans_dict: dict[int, list[ParsedPlan]]
    evaluation_plans_stats: dict[int, PlanStats]

    def load(self, settings: Settings, ml: MLHelper):
        self.ml = ml
        self.evaluation_plans = []
        self.table_count_nodes = {}
        self.evaluation_plans_dict = {}
        for table_count in range(1, settings.eval.max_table_count + 1):
            current_plans = []
            for plan in ml.parsed_plans:
                if plan.graph_nodes_stats[NodeType.TABLE] == table_count and get_hash_joins_count(plan) == table_count - 1:
                    current_plans.append(plan)
                    if len(current_plans) >= settings.eval.max_plans_per_table_count:
                        break
            self.evaluation_plans_dict[table_count] = current_plans
            self.evaluation_plans.extend(current_plans)
        print(f"Loaded {len(self.evaluation_plans)} evaluation nodes. Expected: {settings.eval.max_plans_per_table_count * settings.eval.max_table_count}")
        self.calculate_stats(settings)

    def calculate_stats(self, settings: Settings):
        self.evaluation_plans_stats = {}
        for table_count in range(1, settings.eval.max_table_count + 1):
            plans = self.evaluation_plans_dict[table_count]
            count = len(plans)
            hash_joins_count = 0
            for plan in plans:
                hash_joins_count += get_hash_joins_count(plan)
            self.evaluation_plans_stats[table_count] = PlanStats(plan_count=count, hash_joins_count=hash_joins_count)

    def prepare_all_plans_for_inference(self):
        if self.are_plans_prepared:
            return
        if not self.evaluation_plans:
            raise HTTPException("Evaluation plans are not loaded")
        print("Prepare all plans for inference")
        for plan in tqdm(self.evaluation_plans):
            plan.prepare_plan_for_inference()
        self.are_plans_prepared = True

    def explain_all(self):
        self.prepare_all_plans_for_inference()
        if self.are_plans_explained:
            return

        self.explanations = {}
        print("Explain all plans")
        for explainer_type in ExplainerType:
            self.explanations[explainer_type] = []
            print(explainer_type)
            for plan in tqdm(self.evaluation_plans):
                plan._explanation_cache_for_evaluation[explainer_type] = self.ml.get_explainer(explainer_type).explain(plan)
        self.are_plans_explained = True


def evaluation_plans(evaluation_plans_loader: Annotated[EvaluationPlansLoader, Depends()]):
    if not evaluation_plans_loader.evaluation_plans:
        raise HTTPException("Evaluation plans are not loaded")

    evaluation_plans_loader.prepare_all_plans_for_inference()
    return evaluation_plans_loader.evaluation_plans
