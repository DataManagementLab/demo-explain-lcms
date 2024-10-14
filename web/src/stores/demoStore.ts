import { create } from 'zustand';

interface State {
  datasetId: number | undefined;
  workloadId: number | undefined;
  queryId: number | undefined;
}

interface Action {
  setDatasetId: (datasetId: number) => void;
  setWorkloadId: (workloadId: number) => void;
  setQueryId: (datasetId: number) => void;
  resetDatasetId: () => void;
  resetWorkloadId: () => void;
  resetQueryId: () => void;
}

const initialState: State = {
  datasetId: undefined,
  workloadId: undefined,
  queryId: undefined,
};

export const useDemoStore = create<State & Action>((set) => ({
  ...initialState,

  setDatasetId: (datasetId: number) => set(() => ({ datasetId: datasetId })),
  resetDatasetId: () => set(() => ({ datasetId: undefined })),
  setWorkloadId: (workloadId: number) =>
    set(() => ({ workloadId: workloadId })),
  resetWorkloadId: () => set(() => ({ workloadId: undefined })),
  setQueryId: (queryId: number) => set(() => ({ queryId: queryId })),
  resetQueryId: () => set(() => ({ queryId: undefined })),
}));
