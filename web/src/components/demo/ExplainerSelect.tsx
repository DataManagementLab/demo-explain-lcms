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
  BaseExplainer: 'bold p-1.5',
  BaseExplainerCardinality: 'bold p-1.5',
  BaseExplainerNodeDepth: 'bold p-1.5',
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
            <div className="bg-accent px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
              Query Properties
            </div>
            {baseExplainers.map((explainerType) => (
                <SelectItem
                    value={explainerType}
                    key={explainerType}
                    className={explainerBackgrounds[explainerType] || 'bold p-1.5'}
                >
                  {explainerTypeToDisplay[explainerType]}
                </SelectItem>
            ))}

            <div className="bg-accent px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
              Explainers
            </div>
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