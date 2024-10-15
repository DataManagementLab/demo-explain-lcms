import { PickPartial } from '@/lib/pickPartial';
import { skipToken, useQuery } from '@tanstack/react-query';

import api from '../lib/api';
import { Dataset, FullPlan, QueriesPage, Workload } from './data/queries';

function getDatasets() {
  return api.get<Dataset[]>('datasets').json();
}

export function useGetDatasets() {
  return useQuery({ queryKey: ['datasets'], queryFn: getDatasets });
}

interface GetWorkloadsParams {
  datasetId: number;
}

function getWorkloads({ datasetId }: GetWorkloadsParams) {
  return api.get<Workload[]>(`datasets/${datasetId}/workloads`).json();
}

export function useGetWorkloads({ datasetId }: Partial<GetWorkloadsParams>) {
  return useQuery({
    queryKey: ['workloads', datasetId],
    queryFn:
      datasetId != undefined ? () => getWorkloads({ datasetId }) : skipToken,
  });
}

interface GetQueriesParams {
  workloadId: number;
  offset: number;
  limit: number;
}

function getQueries({ workloadId, offset, limit }: GetQueriesParams) {
  return api
    .get<QueriesPage>(`workloads/${workloadId}/queries`, {
      searchParams: {
        offset: offset,
        limit: limit,
      },
    })
    .json();
}

export function useGetQueries({
  workloadId,
  offset,
  limit,
}: PickPartial<GetQueriesParams, 'workloadId'>) {
  return useQuery({
    queryKey: ['queries', workloadId, offset, limit],
    queryFn:
      workloadId != undefined
        ? () => getQueries({ workloadId, offset, limit })
        : skipToken,
    placeholderData: (prevData, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] == workloadId ? prevData : undefined,
  });
}

interface GetQueryParams {
  queryId: number;
}

function getQuery({ queryId }: GetQueryParams) {
  return api.get<FullPlan>(`queries/${queryId}`).json();
}

export function useGetQuery({ queryId }: Partial<GetQueryParams>) {
  return useQuery({
    queryKey: ['query', queryId],
    queryFn: queryId ? () => getQuery({ queryId }) : skipToken,
  });
}
