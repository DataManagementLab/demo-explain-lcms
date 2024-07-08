import math
import matplotlib.pyplot as plt
from evaluation.schemas import TablesToScore
from evaluation.utils import float_range
from ml.service import ExplainerType
from zero_shot_learned_db.explainers.load import NodeType, ParsedPlan, Plan


def draw_fidelity_score(data: dict[ExplainerType, list[TablesToScore]], dir: str):
    plt.figure()
    max_tables = max([score.table_count for scores in data.values() for score in scores])
    max_score = math.ceil(max([score.score for scores in data.values() for score in scores]))
    for key, scores in data.items():
        plt.plot([s.table_count for s in scores], [s.score for s in scores], label=key)
    plt.xticks(range(1, max_tables + 1))
    plt.yticks(float_range(1, max_score + 1))
    plt.xlabel("Table count")
    plt.ylabel("Fidelity")
    plt.title("Fidelity Evaluation")
    plt.legend()
    plt.savefig(f"{dir}/plot_fidelity.png")


def draw_cost_score(data: dict[ExplainerType, list[TablesToScore]], dir: str):
    plt.figure()
    max_tables = max([score.table_count for scores in data.values() for score in scores])
    for key, scores in data.items():
        plt.plot([s.table_count for s in scores], [s.score for s in scores], label=key)
    plt.xticks(range(1, max_tables + 1))
    plt.yticks(float_range(0, 2, floats=10))
    plt.xlabel("Table count")
    plt.ylabel("Cost hit rate")
    plt.title("Cost Evaluation")
    plt.legend()
    plt.savefig(f"{dir}/plot_cost.png")


def get_hash_joins_count(plan: ParsedPlan):
    hash_joins_count = 0
    for node in plan.graph_nodes:
        if node.node.node_type != NodeType.PLAN:
            continue
        operator: Plan = node.node
        if operator.plan_parameters.op_name == "Hash Join":
            hash_joins_count += 1
    return hash_joins_count
