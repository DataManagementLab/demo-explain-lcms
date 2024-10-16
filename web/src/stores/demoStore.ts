import { create } from 'zustand';

interface State {
  datasetId: number | undefined;
  workloadId: number | undefined;
  queriesPage: number;
  queryId: number | undefined;
  selectedNodeId: number | undefined;
}

interface Action {
  setDatasetId: (datasetId: number) => void;
  setWorkloadId: (workloadId: number) => void;
  setQueriesPage: (queriesPage: number) => void;
  setQueryId: (datasetId: number) => void;
  setSelectedNodeId: (selectedNodeId: number | undefined) => void;
}

const initialState: State = {
  datasetId: undefined,
  workloadId: undefined,
  queriesPage: 0,
  queryId: undefined,
  selectedNodeId: undefined,
};

export const useDemoStore = create<State & Action>((set) => ({
  ...initialState,

  setDatasetId: (datasetId: number) =>
    set(() => ({
      datasetId: datasetId,
      workloadId: undefined,
      queriesPage: 0,
      queryId: undefined,
      nodeId: undefined,
    })),
  setWorkloadId: (workloadId: number) =>
    set(() => ({
      workloadId: workloadId,
      queriesPage: 0,
      queryId: undefined,
      nodeId: undefined,
    })),
  setQueriesPage: (queriesPage: number) =>
    set(() => ({
      queriesPage: queriesPage,
      queryId: undefined,
      nodeId: undefined,
    })),
  setQueryId: (queryId: number) =>
    set(() => ({
      queryId: queryId,
      nodeId: undefined,
    })),
  setSelectedNodeId: (selectedNodeId: number | undefined) => {
    set(() => ({
      selectedNodeId: selectedNodeId,
    }));
  },
}));
