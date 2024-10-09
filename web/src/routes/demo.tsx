import { useState } from 'react';
import { getDatasets, getWorkloads } from '@/api/demo';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demo')({
  component: Demo,
  loader: () => getDatasets(),
});

function Demo() {
  const datasets = Route.useLoaderData();
  const [datasetId, setDatasetId] = useState<number | undefined>();
  const workloads = useQuery({
    queryKey: ['workloads', datasetId],
    queryFn: () => getWorkloads(datasetId!),
    enabled: datasetId != undefined,
  });
  const [workloadId, setWorkloadId] = useState<number | undefined>();

  return (
    <div className="grid grid-cols-2">
      <Card className="col-span-1 flex gap-2 p-4">
        <Select
          value={datasetId?.toString()}
          onValueChange={(value) => {
            setDatasetId(parseInt(value));
            setWorkloadId(undefined);
          }}
        >
          <SelectTrigger className="grow">
            <SelectValue placeholder="Select Dataset" />
          </SelectTrigger>
          <SelectContent>
            {datasets.map((dataset) => (
              <SelectItem value={dataset.id.toString()} key={dataset.id}>
                {dataset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {workloads.isSuccess && (
          <Select
            key={workloadId}
            value={workloadId?.toString()}
            onValueChange={(value) => setWorkloadId(parseInt(value))}
          >
            <SelectTrigger className="grow">
              <SelectValue placeholder="Select Workload" />
            </SelectTrigger>
            <SelectContent>
              {workloads.data.map((workload) => (
                <SelectItem value={workload.id.toString()} key={workload.id}>
                  {workload.fileName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {!workloads.isSuccess && <div className="w-full grow px-3"></div>}
      </Card>
    </div>
  );
}
