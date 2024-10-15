import { ExplainerType } from '@/api/data/inference';
import { useGetExplanation } from '@/api/inference';
import { useGetQuery } from '@/api/queries';
import { round } from '@/lib/round';
import { useDemoStore } from '@/stores/demoStore';
import { useShallow } from 'zustand/react/shallow';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';

interface Props {
  explainerName: string;
  explainerType: ExplainerType;
}

export function ExplanationCard({ explainerName, explainerType }: Props) {
  const queryId = useDemoStore(useShallow((store) => store.queryId));
  const explanation = useGetExplanation({
    queryId: queryId,
    explainerType: explainerType,
  });
  const query = useGetQuery({ queryId: queryId });

  return (
    queryId != undefined && (
      <Card className="border-none">
        <CardHeader>
          <CardTitle>{explainerName}</CardTitle>
          <CardDescription>Explanation</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {explanation.data && query.data ? (
            explanation.data.nodeImportance
              .toSorted((a, b) => b.importance - a.importance)
              .slice(0, 5)
              .map((importance) => (
                <div
                  className="flex items-center gap-1"
                  key={importance.nodeId}
                >
                  <Label>
                    {query.data.graphNodes[importance.nodeId].label}
                  </Label>
                  <p>{round(importance.importance)}</p>
                </div>
              ))
          ) : (
            <>
              <Skeleton className="my-1 h-4" />
              <Skeleton className="my-1 h-4" />
              <Skeleton className="my-1 h-4" />
              <Skeleton className="my-1 h-4" />
              <Skeleton className="my-1 h-4" />
            </>
          )}
        </CardContent>
      </Card>
    )
  );
}
