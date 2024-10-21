import { create } from 'zustand';

interface State {
  datasetId: number | undefined;
  workloadId: number | undefined;
  queriesPage: number;
  queryId: number | undefined;
  selectedNodeId: number | undefined;
  showExplanations: boolean;
}

interface Action {
  setDatasetId: (datasetId: number) => void;
  setWorkloadId: (workloadId: number) => void;
  setQueriesPage: (queriesPage: number) => void;
  setQueryId: (datasetId: number) => void;
  setSelectedNodeId: (selectedNodeId: number | undefined) => void;
  toggleExplanaitons: () => void;
}

const initialState: State = {
  datasetId: undefined,
  workloadId: undefined,
  queriesPage: 0,
  queryId: undefined,
  selectedNodeId: undefined,
  showExplanations: false,
};

export const useDemoStore = create<State & Action>((set) => ({
  ...initialState,

  setDatasetId: (datasetId: number) =>
    set(() => ({
      datasetId: datasetId,
      workloadId: undefined,
      queriesPage: 0,
      queryId: undefined,
      selectedNodeId: undefined,
      showExplanations: false,
    })),
  setWorkloadId: (workloadId: number) =>
    set(() => ({
      workloadId: workloadId,
      queriesPage: 0,
      queryId: undefined,
      selectedNodeId: undefined,
      showExplanations: false,
    })),
  setQueriesPage: (queriesPage: number) =>
    set(() => ({
      queriesPage: queriesPage,
      queryId: undefined,
      selectedNodeId: undefined,
      showExplanations: false,
    })),
  setQueryId: (queryId: number) =>
    set(() => ({
      queryId: queryId,
      selectedNodeId: undefined,
      showExplanations: false,
    })),
  setSelectedNodeId: (selectedNodeId: number | undefined) => {
    set(() => ({
      selectedNodeId: selectedNodeId,
    }));
  },
  toggleExplanaitons: () => {
    set(() => ({
      showExplanations: true,
    }));
  },
}));
