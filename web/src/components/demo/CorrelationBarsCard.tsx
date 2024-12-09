import { useState } from 'react';
import { ExplainerType, explainerTypeToDisplay } from '@/api/data/inference';
import { useGetExplanations } from '@/api/inference';
import { useGetQuery } from '@/api/queries';
import { getBarColor } from '@/lib/barColors';
import { useDemoStore } from '@/stores/demoStore';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { CorrelationBarSingle } from './CorrelationBarSingle';

interface Props {
  baseExplainersType: ExplainerType;
  explainerTypes: ExplainerType[];
}

export function CorrelationBarsCard({
  baseExplainersType,
  explainerTypes,
}: Props) {
  const [queryId, selectedNodeId, setSelectedNodeId] = useDemoStore(
    useShallow((state) => [
      state.queryId,
      state.selectedNodeId,
      state.setSelectedNodeId,
    ]),
  );
  const explanations = useGetExplanations({
    queryId: queryId,
    explainerTypes: explainerTypes,
  });
  const query = useGetQuery({ queryId: queryId });

  const validExplanations = explanations.isSuccess
    ? explanations.data.map((explanation) =>
        explanation.scaledImportance.filter((i) => i.score >= 0.01),
      )
    : undefined;

  const [showLegend, setShowLegend] = useState(false);

  return (
    <Card className="h-w-full border-none">
      <CardHeader>
        <CardTitle>{`Correlation with ${explainerTypeToDisplay[baseExplainersType]}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {validExplanations && query.isSuccess ? (
            <>
              {validExplanations.map((explanation, i) => (
                <div
                  className="flex flex-col gap-1"
                  key={`bar-${explainerTypes[i]}`}
                >
                  <Label>{explainerTypeToDisplay[explainerTypes[i]]}</Label>
                  <CorrelationBarSingle
                    explanation={explanation}
                    selectedNodeId={selectedNodeId}
                    setSelectedNodeId={setSelectedNodeId}
                  />
                </div>
              ))}

              {showLegend && (
                <Table>
                  <TableBody>
                    {query.data.graphNodes
                      .map((node) => node.nodeId)
                      .map((nodeId) => (
                        <TableRow
                          key={nodeId}
                          onClick={() => setSelectedNodeId(nodeId)}
                          data-state={
                            nodeId == selectedNodeId ? 'selected' : ''
                          }
                        >
                          <TableCell>
                            {query.data.graphNodes[nodeId].label}
                          </TableCell>
                          <TableCell>
                            <div
                              className="h-6 w-6"
                              style={{
                                backgroundColor: getBarColor(nodeId),
                              }}
                            ></div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
              <Button
                className="items-start"
                variant="link"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
              >
                {showLegend ? 'Hide Legend' : 'Show Legend'}
              </Button>
            </>
          ) : (
            explainerTypes.map((i) => (
              <Skeleton className="h-6" key={`skeleton-${i}`} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
