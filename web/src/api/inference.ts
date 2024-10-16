import { PickPartial } from '@/lib/pickPartial';
import { skipToken, useQuery } from '@tanstack/react-query';

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
    gcTime: 0,
  });
}

interface GetExplanationParams {
  queryId: number;
  explainerType: ExplainerType;
}

function getExplanation(
  { queryId, explainerType }: GetExplanationParams,
  signal: AbortSignal,
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
    gcTime: 0,
  });
}
