import { GraphNode } from '@/api/data/nodeInfo';
import { create } from 'zustand';

interface State {
  datasetId: number | undefined;
  workloadId: number | undefined;
  queriesPage: number;
  queryId: number | undefined;
  selectedNode: GraphNode | undefined;
}

interface Action {
  setDatasetId: (datasetId: number) => void;
  setWorkloadId: (workloadId: number) => void;
  setQueriesPage: (queriesPage: number) => void;
  setQueryId: (datasetId: number) => void;
  setSelectedNode: (node: GraphNode | undefined) => void;
}

const initialState: State = {
  datasetId: undefined,
  workloadId: undefined,
  queriesPage: 0,
  queryId: undefined,
  selectedNode: undefined,
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
  setSelectedNode: (selectedNode: GraphNode | undefined) => {
    set(() => ({
      selectedNode: selectedNode,
    }));
  },
}));
