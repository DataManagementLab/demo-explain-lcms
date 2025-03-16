import { ExplainerType } from '@/api/data/inference';
import { useGetExplanation } from '@/api/inference';
import { useGetQuery } from '@/api/queries';
import { NodeTypeLegend } from '@/components/demo/NodeLegend.tsx';
import { GraphViewMode, isGraphViewMode } from '@/lib/GraphViewMode';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { NodeInfoCard } from './NodeInfoCard';
import { QueryGraph } from './QueryGraph';
import { SqlCard } from './SqlCard';

interface Props {
  queryId: number | undefined;
  nodeId: number | undefined;
  setNodeId: (value: number | undefined) => void;
  graphViewMode: GraphViewMode;
  setGraphViewMode: (value: GraphViewMode) => void;
  explainer: ExplainerType;
}

export function DemoGraphContent({
  queryId,
  nodeId,
  setNodeId,
  graphViewMode,
  setGraphViewMode,
  explainer,
}: Props) {
  const query = useGetQuery({ queryId });
  const explanation = useGetExplanation({
    queryId: queryId,
    explainerType: explainer,
  });

  const actualRuntimes = useGetExplanation({
    queryId: queryId,
    explainerType: 'BaseExplainer',
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-44 min-h-44 flex-col overflow-hidden">
        {queryId !== undefined &&
          (nodeId !== undefined ? (
            <NodeInfoCard queryId={queryId} nodeId={nodeId} />
          ) : (
            <SqlCard queryId={queryId} />
          ))}
      </div>
      {queryId !== undefined && (
        <Card className="flex h-full w-full flex-col">
          <CardHeader className="mb-8 flex flex-row">
            <CardTitle>Query Graph</CardTitle>
            <div className="grow"></div>
            <Tabs
              value={graphViewMode}
              onValueChange={(value) =>
                setGraphViewMode(isGraphViewMode(value) ? value : 'nodeTypes')
              }
            >
              <TabsList className="flex w-full justify-center">
                <TabsTrigger value="nodeTypes">Node Types</TabsTrigger>
                <TabsTrigger value="actualRuntimes">
                  Actual Runtimes
                </TabsTrigger>
                <TabsTrigger value="nodeImportance">
                  Node Importance
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="grow" onClick={() => setNodeId(undefined)}>
            {query.isSuccess &&
              (graphViewMode == 'nodeTypes' ||
                (graphViewMode == 'nodeImportance' && explanation.isSuccess) ||
                (graphViewMode == 'actualRuntimes' &&
                  actualRuntimes.isSuccess)) && (
                <QueryGraph
                  fullPlan={query.data}
                  nodeId={nodeId}
                  setNodeId={setNodeId}
                  importanceScores={
                    graphViewMode == 'nodeImportance' && explanation.isSuccess
                      ? explanation.data.scaledImportance
                      : graphViewMode == 'actualRuntimes' &&
                          actualRuntimes.isSuccess
                        ? actualRuntimes.data.scaledImportance
                        : undefined
                  }
                />
              )}
          </CardContent>
          <CardFooter className="-mb-2 flex w-full items-center justify-center">
            <div className="flex flex-row justify-end p-0">
              <NodeTypeLegend graphViewMode={graphViewMode} />
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
