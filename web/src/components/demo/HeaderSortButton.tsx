import { SortKey } from '@/api/queries';
import { ArrowDown, ArrowUp } from 'lucide-react';

import { Button } from '../ui/button';

interface Props {
  text: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  currentAscending: boolean;
  sortChanged: (sortKey: SortKey, ascending: boolean) => void;
}

export function HeaderSortButton({
  text,
  sortKey,
  currentSortKey,
  currentAscending,
  sortChanged,
}: Props) {
  return (
    <Button
      className="p-0"
      variant="link"
      onClick={() =>
        sortChanged(
          sortKey,
          currentSortKey == sortKey ? !currentAscending : true,
        )
      }
    >
      <div className="flex items-center gap-1">
        <div className="size-3" />

        <p>{text}</p>
        {currentSortKey == sortKey ? (
          currentAscending ? (
            <ArrowDown className="size-3" />
          ) : (
            <ArrowUp className="size-3" />
          )
        ) : (
          // <></>
          <div className="size-3" />
        )}
      </div>
    </Button>
  );
}
