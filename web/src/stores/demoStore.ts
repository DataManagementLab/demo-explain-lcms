import { create } from 'zustand';

interface State {
  datasetId: number | undefined;
  workloadId: number | undefined;
  queriesPage: number;
  queryId: number | undefined;
}

interface Action {
  setDatasetId: (datasetId: number) => void;
  setWorkloadId: (workloadId: number) => void;
  setQueriesPage: (queriesPage: number) => void;
  setQueryId: (datasetId: number) => void;
}

const initialState: State = {
  datasetId: undefined,
  workloadId: undefined,
  queriesPage: 0,
  queryId: undefined,
};

export const useDemoStore = create<State & Action>((set) => ({
  ...initialState,

  setDatasetId: (datasetId: number) =>
    set(() => ({
      datasetId: datasetId,
      workloadId: undefined,
      queryId: undefined,
      queriesPage: 0,
    })),
  setWorkloadId: (workloadId: number) =>
    set(() => ({
      workloadId: workloadId,
      queryId: undefined,
      queriesPage: 0,
    })),
  setQueriesPage: (queriesPage: number) =>
    set(() => ({
      queriesPage: queriesPage,
    })),
  setQueryId: (queryId: number) =>
    set(() => ({
      queryId: queryId,
    })),
}));
