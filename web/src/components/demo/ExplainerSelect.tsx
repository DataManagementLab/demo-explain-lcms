import {
  ExplainerType,
  explainerTypes,
  explainerTypeToDisplay,
  isExplainerType,
} from '@/api/data/inference';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Props {
  className?: string;
  explainer: ExplainerType;
  setExplainer: (value: ExplainerType) => void;
}

// Provide default backgrounds for all known ExplainerTypes
const explainerBackgrounds: Record<ExplainerType, string> = {
  GradientExplainer: 'bold p-1.5', // Example background
  GuidedBPExplainer: 'bold p-1.5', // Example background
  GNNExplainer: 'bold p-1.5', // Example background
  GNNExplainerOnlyPlans: 'bold p-1.5', // Example background
  DifferenceExplainer: 'bold p-1.5', // Example background
  DifferenceExplainerOnlyPlans: 'bold p-1.5', // Example background
};

const baseExplainers: ExplainerType[] = [
  'BaseExplainer',
  'BaseExplainerCardinality',
  'BaseExplainerNodeDepth',
];

export function ExplainerSelect({ className, explainer, setExplainer }: Props) {
  return (
      <div className={className}>
        <Select
            value={explainer}
            onValueChange={(value) =>
                setExplainer(isExplainerType(value) ? value : 'BaseExplainer')
            }
        >
          <SelectTrigger
              className={`w-full font-bold ${explainerBackgrounds[explainer] || 'bold p-1.5 font-mono'}`}
          >
            <SelectValue placeholder="Select Explainer">
              {explainerTypeToDisplay[explainer]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {explainerTypes
                .filter((explainerType) => !baseExplainers.includes(explainerType))
                .map((explainerType) => (
                    <SelectItem
                        value={explainerType}
                        key={explainerType}
                        className="bold p-1.5 font-mono"
                    >
                      {explainerTypeToDisplay[explainerType]}
                    </SelectItem>
                ))}
          </SelectContent>
        </Select>
      </div>
  );
}