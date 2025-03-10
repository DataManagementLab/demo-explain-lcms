import { ExplainerType } from '@/api/data/inference';
import { useGetExplanation } from '@/api/inference';
import { useGetQuery } from '@/api/queries';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LabeledSwitch } from './LabeledSwitch';
import { NodeInfoCard } from './NodeInfoCard';
import { QueryGraph } from './QueryGraph';
import { SqlCard } from './SqlCard';

interface Props {
  queryId: number | undefined;
  nodeId: number | undefined;
  setNodeId: (value: number | undefined) => void;
  drawImportance: boolean;
  setDrawImportance: (value: boolean) => void;
  explainer: ExplainerType;
}

export function DemoGraphContent({
  queryId,
  nodeId,
  setNodeId,
  drawImportance,
  setDrawImportance,
  explainer,
}: Props) {
  const query = useGetQuery({ queryId: queryId });
  const explanation = useGetExplanation({
    queryId: queryId,
    explainerType: explainer,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-44 min-h-44 flex-col overflow-hidden">
        {queryId != undefined &&
          (nodeId != undefined ? (
            <NodeInfoCard queryId={queryId} nodeId={nodeId} />
          ) : (
            <SqlCard queryId={queryId} />
          ))}
      </div>
      {queryId != undefined && (
        <Card className="flex h-full w-full flex-col">
          <CardHeader className="mb-8 flex flex-row">
            <CardTitle>Query Graph</CardTitle>
            <div className="grow"></div>
            <LabeledSwitch
              leftLabel="Node Types"
              rightLabel="Node Importance"
              checked={drawImportance}
              onCheckedChange={setDrawImportance}
            ></LabeledSwitch>
          </CardHeader>
          <CardContent className="grow" onClick={() => setNodeId(undefined)}>
            {query.isSuccess && (!drawImportance || explanation.isSuccess) && (
              <QueryGraph
                fullPlan={query.data}
                nodeId={nodeId}
                setNodeId={setNodeId}
                importanceScores={
                  drawImportance && explanation.isSuccess
                    ? explanation.data.scaledImportance
                    : undefined
                }
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
