import { useState } from 'react';
import { ExplainerType, explainerTypeToDisplay } from '@/api/data/inference';
import { nodeTypeToDisplay } from '@/api/data/nodeInfo';
import { useGetExplanation } from '@/api/inference';
import { useGetQuery } from '@/api/queries';
import { round } from '@/lib/round';

import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface Props {
  explainerType: ExplainerType;
  queryId: number;
  nodeId: number | undefined;
  setNodeId: (value: number) => void;
}

const collapsedTableLength = 5;

export function ExplanationCard({
  explainerType,
  queryId,
  nodeId,
  setNodeId,
}: Props) {
  const [showMore, setShowMore] = useState(false);
  const explanation = useGetExplanation({
    queryId: queryId,
    explainerType: explainerType,
  });
  const query = useGetQuery({ queryId: queryId });

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>{explainerTypeToDisplay[explainerType]}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {explanation.isSuccess && query.isSuccess ? (
          <Table>
            <TableBody className="overflow-y-auto">
              {explanation.data.scaledImportance
                .filter((a) => round(a.score) > 0)
                .toSorted((a, b) => b.score - a.score)
                .slice(
                  0,
                  showMore
                    ? explanation.data.scaledImportance.length
                    : collapsedTableLength,
                )
                .map((importance) => (
                  <TableRow
                    key={importance.nodeId}
                    onClick={() => setNodeId(importance.nodeId)}
                    data-state={importance.nodeId == nodeId ? 'selected' : ''}
                  >
                    <TableCell className="font-medium">
                      {query.data.graphNodes[importance.nodeId].label} (
                      {nodeTypeToDisplay.get(
                        query.data.graphNodes[importance.nodeId].nodeInfo
                          .nodeType,
                      )}
                      )
                    </TableCell>
                    <TableCell>{round(importance.score)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <>
            {[...Array(collapsedTableLength).keys()].map((i) => (
              <Skeleton className="h-6" key={i} />
            ))}
          </>
        )}

        <Button
          className="items-start"
          variant="link"
          size="sm"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? 'Show less' : 'Show More'}
        </Button>
      </CardContent>
    </Card>
  );
}
