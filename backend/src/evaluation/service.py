import os.path
from statistics import mean
import matplotlib.pyplot as plt
import matplotlib.lines as mlines
from evaluation.models import EvaluationType
from ml.service import ExplainerType

explainer_to_string = {
    ExplainerType.GRADIENT: "Gradient",
    ExplainerType.GUIDED_BP: "Guided Backpropagation",
    ExplainerType.GNN_EXPLAINER: "GNNExplainer",
    ExplainerType.GNN_EXPLAINER_ONLY_PLANS: "GNNExplainer (Only Plans)",
    ExplainerType.DIFFERENCE_EXPLAINER: "Difference",
    ExplainerType.DIFFERENCE_EXPLAINER_ONLY_PLANS: "Difference (Only Plans)",
}

evaluation_type_string = {
    EvaluationType.FIDELITY_PLUS: "Fidelity+",
    EvaluationType.FIDELITY_MINUS: "Fidelity-",
    EvaluationType.CHARACTERIZATION_SCORE: "Characterization score",
    EvaluationType.PEARSON: "Person correlation with runtime",
    EvaluationType.SPEARMAN: "Spearman correlaiton with runtime",
    EvaluationType.PEARSON_CARDINALITY: "Person correlation with cardinality",
    EvaluationType.SPEARMAN_CARDINALITY: "Spearman correlaiton with cardinality",
    EvaluationType.PEARSON_NODE_DEPTH: "Person correlation with node depth",
    EvaluationType.SPEARMAN_NODE_DEPTH: "Spearman correlaiton with node depth",
}


explainers_for_evaluation = [
    ExplainerType.GRADIENT,
    ExplainerType.GUIDED_BP,
    ExplainerType.GNN_EXPLAINER,
    ExplainerType.GNN_EXPLAINER_ONLY_PLANS,
    ExplainerType.DIFFERENCE_EXPLAINER,
    ExplainerType.DIFFERENCE_EXPLAINER_ONLY_PLANS,
]

colors = ["tab:blue", "tab:cyan", "tab:red", "tab:orange", "tab:purple", "tab:pink"]
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
    plt.title(f"{evaluation_type_string[evaluation_type]}{additional_params} {model_name}")
    plt.legend()

    plt.savefig(os.path.join(output_dir, f"plot_{evaluation_type}_{model_name}{additional_params}.png"))
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

    plt.savefig(os.path.join(output_dir, f"plot_{evaluation_type}_{model_name}_combined.png"))
    plt.close()


def draw_score_evaluations_threshold_trend(data: dict[ExplainerType, dict[str, list[EvaluationScoreToDraw]]], output_dir: str, evaluation_type: EvaluationType, model_name: str, filter_join_counts: int | None = None):
    plt.figure()
    for explainer_type, color in zip(explainers_for_evaluation, colors):
        curr_data = data[explainer_type]
        variants = [v.split("|")[1].split(",")[2].replace("[", "").replace("]", "") for v in curr_data.keys()]
        avgs = [mean([score.score for score in curr_data[v] if filter_join_counts is None or score.join_count == filter_join_counts]) for v in curr_data.keys()]
        plt.plot(
            variants,
            avgs,
            color=color,
            label=explainer_to_string[explainer_type],
        )
    plt.ylim(0, 1)
    plt.xlabel("t_mask variant")
    plt.ylabel(evaluation_type_string[evaluation_type])
    plt.title(f"{evaluation_type_string[evaluation_type]} t_mask trend {'all queries' if filter_join_counts is None else str(filter_join_counts) + ' joins'}")
    plt.legend()

    plt.savefig(os.path.join(output_dir, f"plot_{evaluation_type}_{model_name}_{filter_join_counts}_trend_tmask.png"))
    plt.close()


class QErrorToDraw:
    score: float
    queries_count: int
    join_count: int

    def __init__(self, score: float, join_count: int, queries_count: int):
        self.score = score
        self.join_count = join_count
        self.queries_count = queries_count


def draw_qerrors(data: dict[str, list[QErrorToDraw]], output_dir: str, tag: str | None = None):
    plt.figure()
    for model, scores in data.items():
        plt.plot([s.join_count for s in scores], [s.score for s in scores], label=model)
    max_joins = max([score.join_count for scores in data.values() for score in scores])
    plt.xticks(range(0, max_joins + 1))
    plt.ylim(1, 2.5)
    plt.xlabel("# of join operators")
    plt.ylabel("QError")
    plt.title(f"Prediction QError {tag}")
    plt.legend()

    plt.savefig(os.path.join(output_dir, f"prediction_qerror_{tag}.png"))
    plt.close()
