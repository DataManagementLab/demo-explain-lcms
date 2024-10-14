import { getDatasets } from '@/api/demo';
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

export default function DatasetSelect({ className }: Props) {
  const [datasetId, setDatasetId, resetWorkloadId] = useDemoStore(
    useShallow((state) => [
      state.datasetId,
      state.setDatasetId,
      state.resetWorkloadId,
    ]),
  );
  const datasets = useQuery({ queryKey: ['datasets'], queryFn: getDatasets });

  return (
    datasets.isSuccess && (
      <Select
        value={datasetId?.toString()}
        onValueChange={(value) => {
          setDatasetId(parseInt(value));
          resetWorkloadId();
        }}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select Dataset" />
        </SelectTrigger>
        <SelectContent>
          {datasets.data.map((dataset) => (
            <SelectItem value={dataset.id.toString()} key={dataset.id}>
              {dataset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  );
}
