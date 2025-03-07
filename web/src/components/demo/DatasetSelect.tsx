import { useGetDatasets } from '@/api/queries';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Props {
  className?: string | undefined;
  datasetId: number | undefined;
  setDatasetId: (value: number) => void;
}

export function DatasetSelect({ className, datasetId, setDatasetId }: Props) {
  const datasets = useGetDatasets();


  return (
      datasets.isSuccess && (
          <div className={className}>
            <div className="px-2 mb-0 text-sm font-bold text-gray-700">Dataset</div>
            <Select
                value={datasetId?.toString()}
                onValueChange={(value) => setDatasetId(parseInt(value))}
            >
              <SelectTrigger className="w-full">
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
          </div>
      )
  );
}