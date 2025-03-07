import { useGetWorkloads } from '@/api/queries';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Props {
  className?: string | undefined;
  datasetId: number;
  workloadId: number | undefined;
  setWorkloadId: (value: number) => void;
}


export function WorkloadSelect({
                                 className,
                                 datasetId,
                                 workloadId,
                                 setWorkloadId,
                               }: Props) {
  const workloads = useGetWorkloads({ datasetId: datasetId });

  return (
      workloads.isSuccess && (
          <div className={className}>
            <div className="px-2 mb-0 text-sm font-bold text-gray-700">Workload</div>
            <Select
                key={workloadId}
                value={workloadId?.toString()}
                onValueChange={(value) => setWorkloadId(parseInt(value))}
            >
              <SelectTrigger className="w-full">
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
          </div>
      )
  );
}