import combineUseQueries from '@/lib/combineUseQueries';
import { PickPartial } from '@/lib/pickPartial';
import { skipToken, useQueries, useQuery } from '@tanstack/react-query';

import api from '../lib/api';
import { ExplainerType, Explanation, Prediction } from './data/inference';

interface GetPredictionParams {
  queryId: number;
}

function getPrediction({ queryId }: GetPredictionParams, signal: AbortSignal) {
  return api
    .get<Prediction>(`queries/${queryId}/prediction`, { signal: signal })
    .json();
}

export function useGetPrediction({ queryId }: Partial<GetPredictionParams>) {
  return useQuery({
    queryKey: ['prediction', queryId],
    queryFn:
      queryId != undefined
        ? ({ signal }) => getPrediction({ queryId }, signal)
        : skipToken,
  });
}

interface GetExplanationParams {
  queryId: number;
  explainerType: ExplainerType;
}

function getExplanation(
  { queryId, explainerType }: GetExplanationParams,
  signal?: AbortSignal,
) {
  return api
    .get<Explanation>(`queries/${queryId}/explanation/${explainerType}`, {
      signal: signal,
    })
    .json();
}

export function useGetExplanation({
  queryId,
  explainerType,
}: PickPartial<GetExplanationParams, 'queryId'>) {
  return useQuery({
    queryKey: ['explanation', explainerType, queryId],
    queryFn:
      queryId != undefined
        ? ({ signal }) => getExplanation({ queryId, explainerType }, signal)
        : skipToken,
  });
}

export function useGetExplanations({
  queryId,
  explainerTypes,
}: {
  queryId: number | undefined;
  explainerTypes: ExplainerType[];
}) {
  return useQueries({
    queries: explainerTypes.map(
      (explainerType) =>
        ({
          queryKey: ['explanation', explainerType, queryId],
          queryFn:
            queryId != undefined
              ? () => getExplanation({ queryId, explainerType })
              : skipToken,
        }) as const,
    ),
    combine: combineUseQueries,
  });
}
