import { useEffect, useState } from 'react';

export interface SelectedInfo<T> {
  item: T;
  isSelected: boolean;
}

type SelectedInfoKey = 'selectedExplainers' | 'selectedEvaluations';

export function useSelectedInfo<T>(key: SelectedInfoKey, initialItems: T[]) {
  const storedSelectedStr = localStorage.getItem(key);
  const storedSelected = storedSelectedStr
    ? (JSON.parse(storedSelectedStr) as SelectedInfo<T>[])
    : undefined;
  const [selected, setSelected] = useState(
    storedSelected != undefined && storedSelected.length == initialItems.length
      ? storedSelected
      : initialItems.map(
          (item) =>
            ({
              item: item,
              isSelected: true,
            }) satisfies SelectedInfo<T>,
        ),
  );

  useEffect(
    () => localStorage.setItem(key, JSON.stringify(selected)),
    [selected],
  );

  const setSelectedItem = (item: T, value: boolean) => {
    return setSelected(
      selected.map((i) =>
        i.item != item
          ? i
          : {
              item: item,
              isSelected: value,
            },
      ),
    );
  };

  return [selected, setSelectedItem] as const;
}
