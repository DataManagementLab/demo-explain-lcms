from typing import Annotated
from fastapi import Depends, HTTPException

from ml.dependencies import MLHelper
from ml.service import ExplainerType
from query.dependecies import get_explainer_optional_for_parsed_plan, get_parsed_plan_for_inference, inference_mutex
from query.schemas import ExplanationResponseBase

from zero_shot_learned_db.explanations.data_models.explanation import Explanation
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explanations.load import ParsedPlan


class EvaluationBaseParams:
    parsed_plan: ParsedPlan
    base_explainer: BaseExplainer
    base_cardinality_explainer: BaseExplainer
    explanation: Explanation

    def __init__(self, parsed_plan: ParsedPlan, base_explainer: BaseExplainer, base_cardinality_explainer: BaseExplainer, explanation: Explanation):
        self.parsed_plan = parsed_plan
        self.base_explainer = base_explainer
        self.base_cardinality_explainer = base_cardinality_explainer
        self.explanation = explanation


def evaluation_base_params(
    parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan_for_inference)],
    explainer: Annotated[BaseExplainer, Depends(get_explainer_optional_for_parsed_plan)],
    inference_mutex: Annotated[None, Depends(inference_mutex)],
    ml: Annotated[MLHelper, Depends()],
    explanation: ExplanationResponseBase | None = None,
):
    if explainer is None and explanation is None:
        raise HTTPException(422, "Either explainer or explanation should be specified")
    if explanation is None:
        explanation = explainer.explain(parsed_plan)
    explanation = Explanation(node_count=len(parsed_plan.graph_nodes), **explanation.model_dump(exclude=["node_count"]))

    yield EvaluationBaseParams(
        parsed_plan=parsed_plan,
        base_explainer=ml.get_explainer(ExplainerType.BASE, parsed_plan.dataset_name),
        base_cardinality_explainer=ml.get_explainer(ExplainerType.BASE_CARDINALITY, parsed_plan.dataset_name),
        explanation=explanation,
    )
