from enum import StrEnum

from zero_shot_learned_db.explainers.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explainers.explainers.gradient_explainer import GradientExplainer
from zero_shot_learned_db.explainers.explainers.guided_bp_explainer import GuidedBPExplainer


class ExplainerType(StrEnum):
    BASE = "base_explainer"
    GRADIENT = "gradient_explainer"
    GUIDED_BP = "guided_bp_explainer"


explainers: dict[ExplainerType, type[BaseExplainer]] = {
    ExplainerType.BASE: BaseExplainer,
    ExplainerType.GRADIENT: GradientExplainer,
    ExplainerType.GUIDED_BP: GuidedBPExplainer,
}
