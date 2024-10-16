import { useState } from 'react';
import { ExplainerType } from '@/api/data/inference';
import { useGetExplanation } from '@/api/inference';
import { useGetQuery } from '@/api/queries';
import { round } from '@/lib/round';
import { useDemoStore } from '@/stores/demoStore';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface Props {
  explainerName: string;
  explainerType: ExplainerType;
}

export function ExplanationCard({ explainerName, explainerType }: Props) {
  const [showMore, setShowMore] = useState(false);
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
          <Table className="">
            <TableBody className="overflow-y-auto">
              {explanation.isSuccess && query.isSuccess ? (
                explanation.data.nodeImportance
                  .toSorted((a, b) => b.importance - a.importance)
                  .slice(
                    0,
                    showMore ? explanation.data.nodeImportance.length : 5,
                  )
                  .map((importance) => (
                    <TableRow key={importance.nodeId}>
                      <TableCell className="max-w-12 font-medium">
                        {query.data.graphNodes[importance.nodeId].label}
                      </TableCell>
                      <TableCell>{round(importance.importance)}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <>
                  <Skeleton className="my-2 h-6" />
                  <Skeleton className="my-2 h-6" />
                  <Skeleton className="my-2 h-6" />
                  <Skeleton className="my-2 h-6" />
                  <Skeleton className="my-2 h-6" />
                </>
              )}
            </TableBody>
          </Table>
          <Button
            className="mt-2 items-start"
            variant="link"
            size="sm"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'Show less' : 'Show More'}
          </Button>
        </CardContent>
      </Card>
    )
  );
}
