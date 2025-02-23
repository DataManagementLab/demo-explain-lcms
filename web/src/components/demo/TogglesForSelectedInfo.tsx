import { SelectedInfo } from '@/lib/useSelectedInfo';

import { Separator } from '../ui/separator';
import { LabeledSwitch } from './LabeledSwitch';

interface Props<T extends string> {
  title: string;
  selectedInfos: SelectedInfo<T>[];
  toggleSelectedInfo: (key: T, value: boolean) => void;
  displayStrings: Record<T, string>;
}

export function TogglesForSelectedInfo<T extends string>({
  title,
  selectedInfos,
  toggleSelectedInfo,
  displayStrings,
}: Props<T>) {
  return (
    <div className="flex flex-col">
      <h4>{title}</h4>
      <Separator className="mt-0.5 mb-2"></Separator>
      <div className="flex flex-col gap-1">
        {selectedInfos.map((selectedInfo) => (
          <LabeledSwitch
            key={selectedInfo.item}
            id={selectedInfo.item}
            label={displayStrings[selectedInfo.item]}
            checked={selectedInfo.isSelected}
            onCheckedChange={(value) => {
              toggleSelectedInfo(selectedInfo.item, value);
            }}
          />
        ))}
      </div>
    </div>
  );
}
