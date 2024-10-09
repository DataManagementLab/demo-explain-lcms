import { useState } from 'react';
import { getDatasets, getWorkloads } from '@/api/demo';
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
  component: () => Demo(),
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

  return (
    <div className="flex flex-col">
      <div className="flex space-x-1">
        <Select onValueChange={(value) => setDatasetId(parseInt(value))}>
          <SelectTrigger className="w-[180px]">
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
          <Select>
            <SelectTrigger className="w-[180px]">
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
      </div>
    </div>
  );
}
