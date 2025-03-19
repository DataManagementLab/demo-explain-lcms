import { combineUseQueries } from '@/lib/combineUseQueries';
import { PickPartial } from '@/lib/pickPartial';
import {
  skipToken,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '../lib/api';
import {
  ExplainerType,
  Explanation,
  Prediction,
  ZeroShotModelsResponse,
} from './data/inference';

interface GetPredictionParams {
  queryId: number;
  modelId: number | undefined;
}

function getPrediction(
  { queryId, modelId }: GetPredictionParams,
  signal: AbortSignal,
) {
  return api
    .get<Prediction>(`queries/${queryId}/prediction`, {
      signal: signal,
      searchParams: { ...(modelId != undefined && { model_id: modelId }) },
    })
    .json();
}

export function useGetPrediction({
  queryId,
  modelId,
}: Partial<GetPredictionParams>) {
  return useQuery({
    queryKey: ['prediction', queryId, modelId],
    queryFn:
      queryId != undefined
        ? ({ signal }) => getPrediction({ queryId, modelId }, signal)
        : skipToken,
  });
}

interface GetExplanationParams {
  queryId: number;
  explainerType: ExplainerType;
  modelId: number | undefined;
}

function getExplanation(
  { queryId, explainerType, modelId }: GetExplanationParams,
  signal?: AbortSignal,
) {
  return api
    .get<Explanation>(`queries/${queryId}/explanation/${explainerType}`, {
      signal: signal,
      searchParams: { ...(modelId != undefined && { model_id: modelId }) },
    })
    .json();
}

export function useGetExplanation({
  queryId,
  explainerType,
  modelId,
}: PickPartial<GetExplanationParams, 'queryId'>) {
  return useQuery({
    queryKey: ['explanation', explainerType, queryId, modelId],
    queryFn:
      queryId != undefined
        ? ({ signal }) =>
            getExplanation({ queryId, explainerType, modelId }, signal)
        : skipToken,
  });
}

export function useGetExplanations({
  queryId,
  explainerTypes,
  modelId,
}: {
  queryId: number | undefined;
  explainerTypes: ExplainerType[];
  modelId: number | undefined;
}) {
  return useQueries({
    queries: explainerTypes.map(
      (explainerType) =>
        ({
          queryKey: ['explanation', explainerType, queryId, modelId],
          queryFn:
            queryId != undefined
              ? () => getExplanation({ queryId, explainerType, modelId })
              : skipToken,
        }) as const,
    ),
    combine: combineUseQueries,
  });
}

function getZeroShotModels() {
  return api.get<ZeroShotModelsResponse>('zero-shot-models').json();
}

export function useGetZeroShotModels() {
  return useQuery({
    queryKey: ['zero-shot-models'],
    queryFn: getZeroShotModels,
  });
}

function postZeroShotModel({ name, file }: { name: string; file: File }) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('file', file);
  return api.post('zero-shot-models', { body: formData });
}

export function usePostZeroShotModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postZeroShotModel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['zero-shot-models'] });
    },
  });
}

function deleteZeroShotModel({ modelId }: { modelId: number }) {
  return api.delete('zero-shot-models', {
    searchParams: { model_id: modelId },
  });
}

export function useDeleteZeroShotModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteZeroShotModel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['zero-shot-models'] });
    },
  });
}
