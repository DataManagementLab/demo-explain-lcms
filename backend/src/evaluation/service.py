from enum import StrEnum
from statistics import mean
from typing import Callable
import matplotlib.pyplot as plt
import matplotlib.lines as mlines
from tqdm import tqdm
from evaluation.models import EvaluationType
from evaluation.schemas import CorrelationEvaluation, CorrelationScore, TablesToScore, TablesToScoreEvaluationResponse
from utils import load_model_from_file, save_model_to_file
from evaluation.utils import float_range
from ml.service import ExplainerType
from zero_shot_learned_db.explanations.data_models.evaluation import FidelityEvaluation
from zero_shot_learned_db.explanations.data_models.nodes import NodeType, Plan
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explanations.load import ParsedPlan

explainer_to_string = {
    ExplainerType.BASE: "Runtime Importance",
    ExplainerType.GRADIENT: "Gradient",
    ExplainerType.GUIDED_BP: "Guided Backpropagation",
    ExplainerType.GNN_EXPLAINER: "GNNExplainer",
    ExplainerType.GNN_EXPLAINER_ONLY_PLANS: "GNNExplainer (Only Plans)",
}

evaluation_type_string = {
    EvaluationType.FIDELITY_PLUS: "Fidelity+",
    EvaluationType.FIDELITY_MINUS: "Fidelity-",
    EvaluationType.PEARSON: "Person correlation with runtime",
    EvaluationType.SPEARMAN: "Spearman correlaiton with runtime",
    EvaluationType.PEARSON_CARDINALITY: "Person correlation with cardinality",
    EvaluationType.SPEARMAN_CARDINALITY: "Spearman correlaiton with cardinality",
}


class FidelityType(StrEnum):
    PLUS = "plus"
    MINUS = "minus"


def draw_fidelity_score(data: dict[ExplainerType, list[TablesToScore]], output_dir: str, fidelity_type: FidelityType):
    plt.figure()
    for key, scores in data.items():
        plt.plot([s.table_count - 1 for s in scores], [s.score for s in scores], label=explainer_to_string[key])
    max_tables = max([score.table_count for scores in data.values() for score in scores])
    plt.xticks(range(0, max_tables))
    plt.ylim(0, 1)
    plt.xlabel("# of join operators")
    plt.ylabel(f"Fidelity {fidelity_type}")
    plt.title(f"Fidelity {fidelity_type} evaluation")
    plt.legend()
    plt.savefig(f"{output_dir}/plot_fidelity_{fidelity_type}.png")


def draw_cost_score(data: dict[ExplainerType, list[TablesToScore]], output_dir: str):
    plt.figure()
    max_tables = max([score.table_count for scores in data.values() for score in scores])
    for key, scores in data.items():
        plt.plot([s.table_count - 1 for s in scores], [s.score for s in scores], label=explainer_to_string[key])
    plt.xticks(range(0, max_tables))
    plt.yticks(float_range(0, 2, floats=10))
    plt.xlabel("# of join operators")
    plt.ylabel("Cost hit rate")
    plt.title("Cost Evaluation")
    plt.legend()
    plt.savefig(f"{output_dir}/plot_cost.png")


def get_hash_joins_count(plan: ParsedPlan):
    hash_joins_count = 0
    for node in plan.graph_nodes:
        if node.node.node_type != NodeType.PLAN:
            continue
        operator: Plan = node.node
        if operator.plan_parameters.op_name == "Hash Join":
            hash_joins_count += 1
    return hash_joins_count


def draw_scatter_node_importance(
    node_importances: list[dict[int, float]],
    actual_node_importances: list[dict[int, float]],
    explainer: ExplainerType,
    output_dir: str,
    postfix: str = "all",
):
    plt.figure()

    x: list[float] = []
    y: list[float] = []
    max_value = 0

    for plan in zip(node_importances, actual_node_importances):
        node_importance = plan[0]
        actual_node_importance = plan[1]
        for node in node_importance:
            if node not in actual_node_importance:
                continue
            x.append(node_importance[node])
            y.append(actual_node_importance[node])
            max_value = max(node_importance[node], actual_node_importance[node], max_value)

    plt.scatter(x, y, marker="x")
    plt.plot([0, max_value], [0, max_value], "g--")

    plt.xlabel("Importance from explainer")
    plt.ylabel("Importance from runtime")
    plt.title("Correlation between actual runtime and importance")
    plt.savefig(f"{output_dir}/plot_scatter_node_importance_{explainer}_{postfix}.png")


def draw_correlation_evaluations(correlation_evaluations: dict[ExplainerType, CorrelationEvaluation], plot_name: str, output_dir: str):
    plt.figure()

    for explainer, correlation in correlation_evaluations.items():
        plt.plot([c.table_count - 1 for c in correlation.correlations_mean], [c.score for c in correlation.correlations_mean], label=explainer_to_string[explainer])
    max_tables = max([c.table_count for correlation in correlation_evaluations.values() for c in correlation.correlations])
    plt.xticks(range(0, max_tables))
    plt.xlabel("# of join operators")
    plt.ylabel("Correlation score")
    plt.title(plot_name)
    plt.legend()
    plt.savefig(f"{output_dir}/plot_correlation_{plot_name.replace(' ', '_').lower()}.png")


def get_correlation_evaluation(node_importances: list[dict[int, float]], actual_node_importances: list[dict[int, float]], plans: list[ParsedPlan], correlation_fn: Callable[[dict[int, float], dict[int, float]], float], table_counts: list[int]):
    correlations_to_table = [CorrelationScore(table_count=plans[i].graph_nodes_stats[NodeType.TABLE], score=correlation_fn(node_importances[i], actual_node_importances[i])) for i in range(0, len(plans))]
    correlations_to_table_mean: list[CorrelationScore] = []
    for table_count in table_counts:
        correlations = [c.score for c in correlations_to_table if c.table_count == table_count]
        correlations_to_table_mean.append(CorrelationScore(table_count=table_count, score=mean(correlations)))
    correlations_mean = mean([c.score for c in correlations_to_table])
    return CorrelationEvaluation(correlations=correlations_to_table, correlations_mean=correlations_to_table_mean, correlations_mean_all=correlations_mean)


def compute_fidelity(
    explainer_type: ExplainerType,
    explainer: BaseExplainer,
    evaluation_plans: list[ParsedPlan],
    output_dir: str,
    fidelity_function: Callable[[BaseExplainer, ParsedPlan], FidelityEvaluation],
    fidelity_type: FidelityType,
):
    file_name = f"{output_dir}/fidelity_{fidelity_type}_{explainer_type}.json"
    response = load_model_from_file(TablesToScoreEvaluationResponse, file_name)
    if response is not None:
        return response

    evaluations = [fidelity_function(explainer, plan) for plan in tqdm(evaluation_plans)]
    table_counts = list(set([e._parsed_plan.graph_nodes_stats[NodeType.TABLE] for e in evaluations]))
    table_counts.sort()
    scores: list[TablesToScore] = []
    for table_count in table_counts:
        score = mean([e.score for e in evaluations if e._parsed_plan.graph_nodes_stats[NodeType.TABLE] == table_count])
        scores.append(TablesToScore(table_count=table_count, score=score))

    response = TablesToScoreEvaluationResponse(scores=scores)
    save_model_to_file(response, file_name)
    return response


explainers_for_evaluation = [
    ExplainerType.GRADIENT,
    ExplainerType.GUIDED_BP,
    ExplainerType.GNN_EXPLAINER,
    ExplainerType.GNN_EXPLAINER_ONLY_PLANS,
]

colors = ["tab:blue", "tab:orange", "tab:green", "tab:red"]
line_styles = ["dotted", "dashed", "solid"]


class EvaluationScoreToDraw:
    score: float
    explainer_type: ExplainerType
    join_count: int
    model_name: str

    def __init__(self, score: float, explainer_type: ExplainerType, join_count: int, model_name: str):
        self.score = score
        self.explainer_type = explainer_type
        self.join_count = join_count
        self.model_name = model_name


def draw_score_evaluation(data: dict[ExplainerType, list[EvaluationScoreToDraw]], output_dir: str, evaluation_type: EvaluationType, model_name: str):
    additional_params = ""
    if "|" in evaluation_type:
        evaluation_type, additional_params = evaluation_type.split("|")
    if additional_params != "":
        additional_params = f"_{additional_params}"

    plt.figure()
    for explainer_type, color in zip(explainers_for_evaluation, colors):
        plt.plot([s.join_count for s in data[explainer_type]], [s.score for s in data[explainer_type]], color=color, label=explainer_to_string[explainer_type])
    max_joins = max([score.join_count for scores in data.values() for score in scores])
    plt.xticks(range(0, max_joins + 1))
    plt.ylim(0, 1)
    plt.xlabel("# of join operators")
    plt.ylabel(evaluation_type_string[evaluation_type])
    plt.title(f"{evaluation_type_string[evaluation_type]}{additional_params}")
    plt.legend()

    plt.savefig(f"{output_dir}/plot_{evaluation_type}_{model_name}{additional_params}.png")
    plt.close()


def draw_score_evaluations_combined(data: list[dict[ExplainerType, list[EvaluationScoreToDraw]]], output_dir: str, evaluation_type: EvaluationType, model_name: str, evaluation_type_variants: list[str]):
    legend_handles = []
    for line_color, explainer_type in zip(colors, explainers_for_evaluation):
        legend_handles.append(mlines.Line2D([], [], color=line_color, linestyle="solid", label=explainer_to_string[explainer_type]))
    for line_style, eval_variant in zip(line_styles, evaluation_type_variants):
        legend_handles.append(mlines.Line2D([], [], color="k", linestyle=line_style, label=eval_variant))

    plt.figure()
    for explainer_scores, line_style in zip(data, line_styles):
        for explainer_type, line_color in zip(explainers_for_evaluation, colors):
            plt.plot(
                [s.join_count for s in explainer_scores[explainer_type]],
                [s.score for s in explainer_scores[explainer_type]],
                label=explainer_to_string[explainer_type],
                linestyle=line_style,
                color=line_color,
            )
    max_joins = max([score.join_count for explainer_scores in data for scores in explainer_scores.values() for score in scores])
    plt.xticks(range(0, max_joins + 1))
    plt.ylim(0, 1)
    plt.xlabel("# of join operators")
    plt.ylabel(evaluation_type_string[evaluation_type])
    plt.title(f"{evaluation_type_string[evaluation_type]} Combined")
    plt.legend(handles=legend_handles)

    plt.savefig(f"{output_dir}/plot_{evaluation_type}_{model_name}_combined.png")
    plt.close()
