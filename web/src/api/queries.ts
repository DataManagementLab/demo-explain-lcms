import { PickPartial } from '@/lib/pickPartial';
import { skipToken, useQuery } from '@tanstack/react-query';

import { api } from '../lib/api';
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

export const sortKeys = [
  'id',
  'nodes',
  'plans',
  'joins',
  'tables',
  'columns',
  'predicates',
  'runtime',
] as const;

export type SortKey = (typeof sortKeys)[number];

interface GetQueriesParams {
  workloadId: number;
  offset: number;
  limit: number;
  sortKey: SortKey;
  sortAscending: boolean;
}

function getQueries({
  workloadId,
  offset,
  limit,
  sortKey,
  sortAscending,
}: GetQueriesParams) {
  return api
    .get<QueriesPage>(`workloads/${workloadId}/queries`, {
      searchParams: {
        offset: offset,
        limit: limit,
        order_by: sortKey,
        ascending: sortAscending,
      },
    })
    .json();
}

export function useGetQueries({
  workloadId,
  offset,
  limit,
  sortKey,
  sortAscending,
}: PickPartial<GetQueriesParams, 'workloadId'>) {
  return useQuery({
    queryKey: ['queries', workloadId, offset, limit, sortKey, sortAscending],
    queryFn:
      workloadId != undefined
        ? () =>
            getQueries({ workloadId, offset, limit, sortKey, sortAscending })
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
    queryFn: queryId != undefined ? () => getQuery({ queryId }) : skipToken,
  });
}
