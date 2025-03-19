import { useGetZeroShotModels } from '@/api/inference';
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
  datasetId: number;
  modelId: number | undefined;
  setModelId: (value: number) => void;
}

export function ZeroShotModelsSelect({
  className,
  datasetId,
  modelId: modelIdParam,
  setModelId,
}: Props) {
  const models = useGetZeroShotModels();
  const datasets = useGetDatasets();
  const dataset = datasets.isSuccess
    ? datasets.data.find((d) => d.id == datasetId)
    : undefined;
  const modelId =
    modelIdParam ??
    dataset?.defaultZeroShotModelId ??
    models.data?.defaultModelId;

  return (
    models.isSuccess &&
    datasets.isSuccess && (
      <div className={className}>
        <div className="mb-0 px-2 text-sm font-bold text-gray-700">Model</div>
        <Select
          key={modelId}
          value={modelId?.toString()}
          onValueChange={(value) => setModelId(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {models.data.zeroShotModels.map((model) => (
              <SelectItem value={model.id.toString()} key={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  );
}
