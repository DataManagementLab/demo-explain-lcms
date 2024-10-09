import api from './api';
import { Dataset, Workload } from './data/demo';

export function getDatasets() {
  return api.get<Dataset[]>('datasets').json();
}

export function getWorkloads(datasetId: number) {
  return api.get<Workload[]>(`datasets/${datasetId}/workloads`).json();
}
