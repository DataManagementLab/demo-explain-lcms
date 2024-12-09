from enum import StrEnum

from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explanations.explainers.base_explainer_cardinality import BaseExplainerCardinality
from zero_shot_learned_db.explanations.explainers.base_explainer_node_depth import BaseExplainerNodeDepth
from zero_shot_learned_db.explanations.explainers.gnn_explainer import GNNExplainer
from zero_shot_learned_db.explanations.explainers.gnn_explainer_only_plans import GNNExplainerOnlyPlans
from zero_shot_learned_db.explanations.explainers.gradient_explainer import GradientExplainer
from zero_shot_learned_db.explanations.explainers.difference_explainer import DifferenceExplainer
from zero_shot_learned_db.explanations.explainers.difference_explainer_only_plans import DifferenceExplainerOnlyPlans
from zero_shot_learned_db.explanations.explainers.guided_bp_explainer import GuidedBPExplainer


class ExplainerType(StrEnum):
    BASE = BaseExplainer.__name__
    BASE_CARDINALITY = BaseExplainerCardinality.__name__
    BASE_NODE_DEPTH = BaseExplainerNodeDepth.__name__
    GRADIENT = GradientExplainer.__name__
    GUIDED_BP = GuidedBPExplainer.__name__
    GNN_EXPLAINER = GNNExplainer.__name__
    GNN_EXPLAINER_ONLY_PLANS = GNNExplainerOnlyPlans.__name__
    DIFFERENCE_EXPLAINER = DifferenceExplainer.__name__
    DIFFERENCE_EXPLAINER_ONLY_PLANS = DifferenceExplainerOnlyPlans.__name__


explainers: dict[ExplainerType, type[BaseExplainer]] = {
    ExplainerType.BASE: BaseExplainer,
    ExplainerType.BASE_CARDINALITY: BaseExplainerCardinality,
    ExplainerType.BASE_NODE_DEPTH: BaseExplainerNodeDepth,
    ExplainerType.GRADIENT: GradientExplainer,
    ExplainerType.GUIDED_BP: GuidedBPExplainer,
    ExplainerType.GNN_EXPLAINER: GNNExplainer,
    ExplainerType.GNN_EXPLAINER_ONLY_PLANS: GNNExplainerOnlyPlans,
    ExplainerType.DIFFERENCE_EXPLAINER: DifferenceExplainer,
    ExplainerType.DIFFERENCE_EXPLAINER_ONLY_PLANS: DifferenceExplainerOnlyPlans,
}
