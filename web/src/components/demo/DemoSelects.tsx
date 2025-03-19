import { ArrowLeftToLine, ArrowRightFromLine } from 'lucide-react';

import { Button } from '../ui/button';
import { DatasetSelect } from './DatasetSelect';
import { WorkloadSelect } from './WorkloadSelect';
import { ZeroShotModelsSelect } from './ZeroShotModelsSelect';

interface Props {
  datasetId: number | undefined;
  setDatasetId: (value: number) => void;
  workloadId: number | undefined;
  setWorkloadId: (value: number) => void;
  modelId: number | undefined;
  setModelId: (value: number) => void;
  minimized: boolean;
  setMinimized: (value: boolean) => void;
}

export function DemoSelects({
  datasetId,
  setDatasetId,
  workloadId,
  setWorkloadId,
  modelId,
  setModelId,
  minimized,
  setMinimized,
}: Props) {
  // const workloads = useGetWorkloads({ datasetId: datasetId });

  return (
    <div className="flex items-end gap-2 px-2">
      <DatasetSelect
        className="w-9 grow"
        datasetId={datasetId}
        setDatasetId={setDatasetId}
      />
      {datasetId != undefined && (
        <WorkloadSelect
          className="w-9 grow"
          datasetId={datasetId}
          workloadId={workloadId}
          setWorkloadId={setWorkloadId}
        />
      )}
      {workloadId != undefined && datasetId != undefined && (
        <ZeroShotModelsSelect
          className="w-9 grow"
          datasetId={datasetId}
          modelId={modelId}
          setModelId={setModelId}
        />
      )}
      {/*{!workloads.isSuccess && <div className="w-9 grow px-3"></div>}*/}
      {workloadId != undefined && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMinimized(!minimized)}
        >
          {minimized ? (
            <ArrowRightFromLine className="size-4" />
          ) : (
            <ArrowLeftToLine className="size-4" />
          )}
        </Button>
      )}
    </div>
  );
}
