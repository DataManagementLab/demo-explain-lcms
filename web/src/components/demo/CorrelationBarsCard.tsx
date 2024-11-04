import { useMemo, useState } from 'react';
import { ExplainerType, explainerTypeToDisplay } from '@/api/data/inference';
import { useGetExplanations } from '@/api/inference';
import { useGetQuery } from '@/api/queries';
import { useDemoStore } from '@/stores/demoStore';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { CorrelationBarSingle } from './CorrelationBarSingle';

interface Props {
  title: string;
  explainerTypes: ExplainerType[];
}

export function CorrelationBarsCard({ title, explainerTypes }: Props) {
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

  const baseNodes = explanations.isSuccess
    ? explanations.data[0].scaledImportance.map((i) => i.nodeId)
    : undefined;

  const validExplanations = explanations.isSuccess
    ? explanations.data.map((explanation) =>
        explanation.scaledImportance.filter((i) => i.score >= 0.01),
      )
    : undefined;

  const importanceSortFn = (a: number, b: number) => {
    if (!validExplanations) {
      return 0;
    }
    const aExplanationId = validExplanations.findIndex((e) =>
      e.map((i) => i.nodeId).includes(a),
    );
    const bExplanationId = validExplanations.findIndex((e) =>
      e.map((i) => i.nodeId).includes(b),
    );
    if (aExplanationId != bExplanationId) {
      return bExplanationId - aExplanationId;
    }
    const explanation = validExplanations[aExplanationId];
    const aImportance = explanation.find((i) => i.nodeId == a);
    const bImportance = explanation.find((i) => i.nodeId == b);
    if (aImportance && bImportance) {
      return aImportance.score - bImportance.score;
    }
    return 0;
  };

  const uniqueNodes =
    validExplanations && baseNodes
      ? validExplanations
          .flat()
          .map((i) => i.nodeId)
          .filter((value, index, array) => array.indexOf(value) == index)
          .toSorted(importanceSortFn)
          .toReversed()
      : undefined;
  const nodeIdToColor = useMemo(
    () => new Map<number, string>(),
    [explanations],
  );
  const [renderCount, setRenderCount] = useState(0);
  const [showLegend, setShowLegend] = useState(false);

  return (
    <Card className="h-w-full border-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {validExplanations && uniqueNodes && query.isSuccess ? (
            <>
              {validExplanations.map((explanation, i) => (
                <div className="flex flex-col gap-1" key={explainerTypes[i]}>
                  <Label>{explainerTypeToDisplay.get(explainerTypes[i])}</Label>
                  <CorrelationBarSingle
                    explanation={explanation}
                    uniqueNodes={uniqueNodes}
                    nodeIdToColor={nodeIdToColor}
                    selectedNodeId={selectedNodeId}
                    setSelectedNodeId={setSelectedNodeId}
                    renderCount={renderCount}
                    setRenderCount={setRenderCount}
                  />
                </div>
              ))}

              {showLegend && (
                <Table>
                  <TableBody>
                    {uniqueNodes.map((nodeId) => (
                      <TableRow
                        key={nodeId}
                        onClick={() => setSelectedNodeId(nodeId)}
                        data-state={nodeId == selectedNodeId ? 'selected' : ''}
                      >
                        <TableCell>
                          {query.data.graphNodes[nodeId].label}
                        </TableCell>
                        <TableCell>
                          <div
                            key={renderCount}
                            className="h-6 w-6"
                            style={{
                              backgroundColor: nodeIdToColor.get(nodeId),
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
            explainerTypes.map((i) => <Skeleton className="h-6" key={i} />)
          )}
        </div>
      </CardContent>
    </Card>
  );
}
