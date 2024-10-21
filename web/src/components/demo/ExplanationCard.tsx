import { useState } from 'react';
import { ExplainerType } from '@/api/data/inference';
import { nodeTypeToDisplay } from '@/api/data/nodeInfo';
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
  const queryId = useDemoStore(useShallow((state) => state.queryId));
  const [selectedNodeId, setSelectedNodeId] = useDemoStore(
    useShallow((state) => [state.selectedNodeId, state.setSelectedNodeId]),
  );
  const explanation = useGetExplanation({
    queryId: queryId,
    explainerType: explainerType,
  });
  const query = useGetQuery({ queryId: queryId });

  return (
    queryId != undefined && (
      <Card className="border-none">
        <CardHeader className="p-0 px-6 pb-2 pt-6">
          <CardTitle>Explainer: {explainerName}</CardTitle>
          <CardDescription>
            {explanation.isSuccess
              ? `${round(explanation.data.executionTime)} s`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {explanation.isSuccess && query.isSuccess ? (
            <Table>
              <TableBody className="overflow-y-auto">
                {explanation.data.nodeImportance
                  .filter((a) => round(a.importance) > 0)
                  .toSorted((a, b) => b.importance - a.importance)
                  .slice(
                    0,
                    showMore ? explanation.data.nodeImportance.length : 5,
                  )
                  .map((importance) => (
                    <TableRow
                      key={importance.nodeId}
                      onClick={() => setSelectedNodeId(importance.nodeId)}
                      data-state={
                        importance.nodeId == selectedNodeId ? 'selected' : ''
                      }
                    >
                      <TableCell className="font-medium">
                        {query.data.graphNodes[importance.nodeId].label} (
                        {nodeTypeToDisplay.get(
                          query.data.graphNodes[importance.nodeId].nodeInfo
                            .nodeType,
                        )}
                        )
                      </TableCell>
                      <TableCell>{round(importance.importance)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <>
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
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
    )
  );
}
