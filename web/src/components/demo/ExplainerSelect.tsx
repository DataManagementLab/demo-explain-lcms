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

const explainerBackgrounds: Record<string, string> = {
  'BaseExplainer': 'bg-blue-100',
  'BaseExplainerCardinality': 'bg-blue-100',
  'BaseExplainerNodeDepth': 'bg-blue-100',
};

export function ExplainerSelect({ className, explainer, setExplainer }: Props) {
  return (
    <div className={className}>
      <Select
        value={explainer}
        onValueChange={(value) =>
          setExplainer(isExplainerType(value) ? value : 'BaseExplainer')
        }
      >
        <SelectTrigger className="w-full font-bold">
          <SelectValue placeholder="Select Explainer" />
        </SelectTrigger>
        <SelectContent>
          {explainerTypes.map((explainerType) => (
            <SelectItem
              value={explainerType}
              key={explainerType}
              className={explainerBackgrounds[explainerType] || ''}
            >
              {explainerTypeToDisplay[explainerType]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
