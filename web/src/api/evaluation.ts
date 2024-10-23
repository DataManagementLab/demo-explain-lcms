import { api } from '@/lib/api';
import { combineUseQueries } from '@/lib/combineUseQueries';
import { skipToken, useQueries } from '@tanstack/react-query';

import { CorrelationEvaluation, FidelityEvaluation } from './data/evaluation';
import { Explanation, ExplanationBase } from './data/inference';

interface EvaluationPrams {
  queryId: number;
  explanation: ExplanationBase;
}

function get_fidelity(
  { queryId, explanation }: EvaluationPrams,
  type: 'plus' | 'minus',
) {
  return api
    .post<FidelityEvaluation>(`evaluation-fns/fidelity-${type}`, {
      searchParams: { query_id: queryId },
      json: explanation,
    })
    .json();
}

interface EvaluationPramsFidelity {
  queryId?: number;
  explanations: (Explanation | undefined)[];
  type: 'plus' | 'minus';
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
          queryKey: ['fidelity-plus', queryId, explanation, type],
          queryFn:
            explanation != undefined && queryId != undefined
              ? () => get_fidelity({ queryId, explanation }, type)
              : skipToken,
        }) as const,
    ),
    combine: combineUseQueries,
  });
}

function get_correlation(
  { queryId, explanation }: EvaluationPrams,
  type: 'pearson' | 'spearman',
) {
  return api
    .post<CorrelationEvaluation>(`evaluation-fns/${type}`, {
      searchParams: { query_id: queryId },
      json: explanation,
    })
    .json();
}

interface EvaluationPramsCorrelation {
  queryId?: number;
  explanations: (Explanation | undefined)[];
  type: 'pearson' | 'spearman';
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
          queryKey: ['fidelity-plus', queryId, explanation, type],
          queryFn:
            explanation != undefined && queryId != undefined
              ? () => get_correlation({ queryId, explanation }, type)
              : skipToken,
        }) as const,
    ),
    combine: combineUseQueries,
  });
}
