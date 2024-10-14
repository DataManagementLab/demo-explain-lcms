import { getWorkloads } from '@/api/demo';
import { useDemoStore } from '@/stores/demoStore';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Props {
  className?: string | undefined;
}

export default function WorkloadSelect({ className }: Props) {
  const [datasetId, workloadId, setWorkloadId] = useDemoStore(
    useShallow((state) => [
      state.datasetId,
      state.workloadId,
      state.setWorkloadId,
    ]),
  );
  const workloads = useQuery({
    queryKey: ['workloads', datasetId],
    queryFn: () => getWorkloads(datasetId!),
    enabled: datasetId != undefined,
  });

  console.log('Render WorkloadSelect');

  return (
    workloads.isSuccess && (
      <Select
        key={workloadId}
        value={workloadId?.toString()}
        onValueChange={(value) => setWorkloadId(parseInt(value))}
      >
        <SelectTrigger className={className}>
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
    )
  );
}
