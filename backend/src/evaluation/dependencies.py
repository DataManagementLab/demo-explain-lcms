import os
import os.path
from typing import Annotated
from fastapi import Depends, HTTPException
from tqdm import tqdm

from config import Settings, get_settings
from ml.dependencies import MLHelper
from zero_shot_learned_db.explainers.load import NodeType, ParsedPlan


def get_evaluation_results_dir(config: Annotated[Settings, Depends(get_settings)]):
    if not os.path.exists(config.demo.evaluation_results_dir):
        os.mkdir(config.demo.evaluation_results_dir)
    return config.demo.evaluation_results_dir


class EvaluationPlansLoader:
    evaluation_plans: list[ParsedPlan]
    are_plans_prepared: bool = False
    table_count_nodes: dict[int, int]

    def load(self, settings: Settings, ml: MLHelper):
        self.evaluation_plans = []
        self.table_count_nodes = {}
        current_count = 0
        print("Load evaluation plans")
        for table_count in tqdm(range(1, settings.eval.max_table_count + 1)):
            for plan in ml.parsed_plans:
                if plan.graph_nodes_stats[NodeType.TABLE] == table_count:
                    self.evaluation_plans.append(plan)
                    current_count += 1
                    if current_count >= settings.eval.max_plans_per_table_count:
                        break
            self.table_count_nodes[table_count] = current_count
            current_count = 0

    def prepare_all_plans_for_inference(self):
        if self.are_plans_prepared:
            return
        if not self.evaluation_plans:
            raise HTTPException("Evaluation plans are not loaded")
        print("Prepare all plans for inference")
        for plan in tqdm(self.evaluation_plans):
            plan.prepare_plan_for_inference()
        self.are_plans_prepared = True


def evaluation_plans(evaluation_plans_loader: Annotated[EvaluationPlansLoader, Depends()]):
    if not evaluation_plans_loader.evaluation_plans:
        raise HTTPException("Evaluation plans are not loaded")

    evaluation_plans_loader.prepare_all_plans_for_inference()
    return evaluation_plans_loader.evaluation_plans
