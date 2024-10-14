import api from './api';
import {
  Dataset,
  FullPlan,
  Prediction,
  QueriesPage,
  Workload,
} from './data/demo';

export function getDatasets() {
  return api.get<Dataset[]>('datasets').json();
}

export function getWorkloads(datasetId: number) {
  return api.get<Workload[]>(`datasets/${datasetId}/workloads`).json();
}

export function getQueries(workloadId: number, offset: number, limit: number) {
  return api
    .get<QueriesPage>(`workloads/${workloadId}/queries`, {
      searchParams: {
        offset: offset,
        limit: limit,
      },
    })
    .json();
}

export function getQuery(queryId: number) {
  return api.get<FullPlan>(`queries/${queryId}`).json();
}

export function getPrediction(queryId: number) {
  return api.get<Prediction>(`queries/${queryId}/prediction`).json();
}
