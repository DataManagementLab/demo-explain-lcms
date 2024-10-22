from typing import Annotated
from fastapi import APIRouter, Depends

from evaluation_fns.dependencies import EvaluationBaseParams, evaluation_base_params
from evaluation_fns.schemas import CorrelationEvaluationResponse, FidelityEvaluationResponse, MostImportantNodeEvaluationResponse
from zero_shot_learned_db.explanations.evaluation import evaluation_fidelity_minus, evaluation_fidelity_plus, evaluation_most_important_node, evaluation_pearson_correlation, evaluation_spearman_correlation


router = APIRouter(tags=["evaluation-fns"], prefix="/evaluation-fns")


@router.post("/fidelity-plus", response_model=FidelityEvaluationResponse)
def fidelity_plus(params: Annotated[EvaluationBaseParams, Depends(evaluation_base_params)]):
    return evaluation_fidelity_plus(params.base_explainer, params.explanation, params.parsed_plan)


@router.post("/fidelity-minus", response_model=FidelityEvaluationResponse)
def fidelity_minus(params: Annotated[EvaluationBaseParams, Depends(evaluation_base_params)]):
    return evaluation_fidelity_minus(params.base_explainer, params.explanation, params.parsed_plan)


@router.post("/most-important-node", response_model=MostImportantNodeEvaluationResponse)
def most_important_node(params: Annotated[EvaluationBaseParams, Depends(evaluation_base_params)]):
    return evaluation_most_important_node(params.explanation, params.parsed_plan)


@router.post("/pearson", response_model=CorrelationEvaluationResponse)
def pearson(params: Annotated[EvaluationBaseParams, Depends(evaluation_base_params)]):
    return evaluation_pearson_correlation(params.base_explainer, params.explanation, params.parsed_plan)


@router.post("/spearman", response_model=CorrelationEvaluationResponse)
def spearman(params: Annotated[EvaluationBaseParams, Depends(evaluation_base_params)]):
    return evaluation_spearman_correlation(params.base_explainer, params.explanation, params.parsed_plan)
