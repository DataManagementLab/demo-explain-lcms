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

const baseExplainers: ExplainerType[] = [
  'BaseExplainer',
  'BaseExplainerCardinality',
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
        <SelectTrigger className={`w-full font-bold`}>
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
