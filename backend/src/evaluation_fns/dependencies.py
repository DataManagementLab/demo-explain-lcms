from typing import Annotated
from fastapi import Depends, HTTPException

from ml.dependencies import get_base_explainer, get_explainer_optional
from query.dependecies import get_parsed_plan_for_inference, inference_mutex
from query.schemas import ExplanationResponseBase
from zero_shot_learned_db.explanations.explainers.base_explainer import BaseExplainer
from zero_shot_learned_db.explanations.load import ParsedPlan


class EvaluationBaseParams:
    parsed_plan: ParsedPlan
    base_explainer: BaseExplainer
    explanation: ExplanationResponseBase

    def __init__(self, parsed_plan: ParsedPlan, base_explainer: BaseExplainer, explanation: ExplanationResponseBase):
        self.parsed_plan = parsed_plan
        self.base_explainer = base_explainer
        self.explanation = explanation


def evaluation_base_params(
    parsed_plan: Annotated[ParsedPlan, Depends(get_parsed_plan_for_inference)],
    base_explainer: Annotated[BaseExplainer, Depends(get_base_explainer)],
    explainer: Annotated[BaseExplainer, Depends(get_explainer_optional)],
    inference_mutex: Annotated[None, Depends(inference_mutex)],
    explanation: ExplanationResponseBase | None = None,
):
    if explainer is None and explanation is None:
        raise HTTPException(422, "Either explainer or explanation should be specified")
    if explanation is None:
        explanation = explainer.explain(parsed_plan)

    yield EvaluationBaseParams(parsed_plan=parsed_plan, base_explainer=base_explainer, explanation=explanation)
