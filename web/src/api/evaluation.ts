import { api } from '@/lib/api';
import { combineUseQueries } from '@/lib/combineUseQueries';
import { skipToken, useQueries } from '@tanstack/react-query';

import {
  CorrelationEvaluation,
  CorrelationType,
  correlationTypes,
  FidelityEvaluation,
  FidelityType,
  fidelityTypes,
} from './data/evaluation';
import { Explanation, ExplanationBase } from './data/inference';

interface EvaluationPrams {
  queryId: number;
  explanation: ExplanationBase;
}

function getFidelity(
  { queryId, explanation }: EvaluationPrams,
  type: FidelityType,
) {
  return api
    .post<FidelityEvaluation>(`evaluation-fns/${type}`, {
      searchParams: { query_id: queryId },
      json: explanation,
    })
    .json();
}

interface EvaluationPramsFidelitySingle {
  queryId?: number;
  explanation: Explanation | undefined;
}

export function useGetFidelityEvaluationsAllTypes({
  queryId,
  explanation,
}: EvaluationPramsFidelitySingle) {
  return useQueries({
    queries: fidelityTypes.map(
      (fidelityType) =>
        ({
          queryKey: [queryId, explanation, fidelityType],
          queryFn:
            explanation != undefined && queryId != undefined
              ? () => getFidelity({ queryId, explanation }, fidelityType)
              : skipToken,
        }) as const,
    ),
    combine: combineUseQueries,
  });
}

interface EvaluationPramsFidelity {
  queryId?: number;
  explanations: (Explanation | undefined)[];
  type: FidelityType;
}
export function useGetFidelityEvaluations({
  queryId,
  explanations,
  type,
}: EvaluationPramsFidelity) {
  return useQueries({
    queries: explanations.map(
      (explanation) =>
        ({
          queryKey: [queryId, explanation, type],
          queryFn:
            explanation != undefined && queryId != undefined
              ? () => getFidelity({ queryId, explanation }, type)
              : skipToken,
        }) as const,
    ),
    combine: combineUseQueries,
  });
}

function getCorrelation(
  { queryId, explanation }: EvaluationPrams,
  type: CorrelationType,
) {
  return api
    .post<CorrelationEvaluation>(`evaluation-fns/${type}`, {
      searchParams: { query_id: queryId },
      json: explanation,
    })
    .json();
}

interface EvaluationPramsCorrelationSingle {
  queryId?: number;
  explanation: Explanation | undefined;
}

export function useGetCorrelationEvaluationsAllTypes({
  queryId,
  explanation,
}: EvaluationPramsCorrelationSingle) {
  return useQueries({
    queries: correlationTypes.map(
      (correlationType) =>
        ({
          queryKey: [queryId, explanation, correlationType],
          queryFn:
            explanation != undefined && queryId != undefined
              ? () => getCorrelation({ queryId, explanation }, correlationType)
              : skipToken,
        }) as const,
    ),
    combine: combineUseQueries,
  });
}
interface EvaluationPramsCorrelation {
  queryId?: number;
  explanations: (Explanation | undefined)[];
  type: CorrelationType;
}

export function useGetCorrelaitonEvaluations({
  queryId,
  explanations,
  type,
}: EvaluationPramsCorrelation) {
  return useQueries({
    queries: explanations.map(
      (explanation) =>
        ({
          queryKey: [queryId, explanation, type],
          queryFn:
            explanation != undefined && queryId != undefined
              ? () => getCorrelation({ queryId, explanation }, type)
              : skipToken,
        }) as const,
    ),
    combine: combineUseQueries,
  });
}
