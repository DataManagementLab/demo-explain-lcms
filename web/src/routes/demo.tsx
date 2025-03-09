import { JSX, useState } from 'react';
import { CorrelationType } from '@/api/data/evaluation';
import { ExplainerType, explainerTypes } from '@/api/data/inference';
import { SortKey, sortKeys, useGetQuery, useGetWorkloads } from '@/api/queries';
import { CorrelationBarsCard } from '@/components/demo/CorrelationBarsCard';
import { DatasetSelect } from '@/components/demo/DatasetSelect';
import { ExplainerSelect } from '@/components/demo/ExplainerSelect';
import { ExplanationCard } from '@/components/demo/ExplanationCard';
import { NodeInfoCard } from '@/components/demo/NodeInfoCard';
import { PredictionCard } from '@/components/demo/PredictionCard';
import { QueryGraph } from '@/components/demo/QueryGraph';
import { QueryList } from '@/components/demo/QueryList';
import { SingleExplainerEvaluationCard } from '@/components/demo/SingleExplainerEvaluationCard';
import { SqlCard } from '@/components/demo/SqlCard';
import { WorkloadSelect } from '@/components/demo/WorkloadSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { TabsContent } from '@radix-ui/react-tabs';
import {
  createFileRoute,
  retainSearchParams,
  useNavigate,
} from '@tanstack/react-router';
import { ArrowLeftToLine, ArrowRightFromLine } from 'lucide-react';
import { z } from 'zod';

const demoPageParamsSchema = z.object({
  datasetId: z.number().positive().optional(),
  workloadId: z.number().positive().optional(),
  page: z.number().nonnegative().optional(),
  queryId: z.number().positive().optional(),
  nodeId: z.number().positive().optional(),
  sort: z.enum(sortKeys).optional(),
  asc: z.boolean().optional(),
  explainer: z.enum(explainerTypes).optional(),
});

export const Route = createFileRoute('/demo')({
  component: Demo,
  validateSearch: demoPageParamsSchema,
  search: {
    middlewares: [retainSearchParams(true)],
  },
});

interface BaseExplainerInfo {
  explainerType: ExplainerType;
  pearsonFn: CorrelationType;
  spearmanFn: CorrelationType;
}

const baseExplainerInfos = [
  {
    explainerType: 'BaseExplainer',
    pearsonFn: 'pearson',
    spearmanFn: 'spearman',
  },
  {
    explainerType: 'BaseExplainerCardinality',
    pearsonFn: 'pearson-cardinality',
    spearmanFn: 'spearman-cardinality',
  },
  {
    explainerType: 'BaseExplainerNodeDepth',
    pearsonFn: 'pearson-node-depth',
    spearmanFn: 'spearman-node-depth',
  },
] satisfies BaseExplainerInfo[];

const explanationSections = [
  'Node Ranking',
  'Runtime Correlation',
  'Explainer Evaluation',
] as const;
type ExplanationSection = (typeof explanationSections)[number];

function insertSeparators(elements: JSX.Element[]) {
  return elements.flatMap((value, index) =>
    index == elements.length - 1 ? value : [value, <Separator key={index} />],
  );
}

function Demo() {
  const navigate = useNavigate({ from: Route.fullPath });

  const {
    datasetId,
    workloadId,
    page,
    queryId,
    nodeId,
    sort: sortKey,
    asc: sortAscending,
    explainer: explainerParam,
  } = Route.useSearch();
  const setDatasetId = (value: number | undefined) => {
    resetState();
    void navigate({
      to: '/demo',
      search: {
        datasetId: value,
        workloadId: undefined,
        page: undefined,
        queryId: undefined,
        nodeId: undefined,
        sort: undefined,
        asc: undefined,
      },
    });
  };
  const setWorkloadId = (value: number | undefined) => {
    resetState();
    void navigate({
      search: {
        workloadId: value,
        page: undefined,
        queryId: undefined,
        nodeId: undefined,
        sort: undefined,
        asc: undefined,
      },
    });
  };
  const setPage = (value: number) => {
    resetState();
    void navigate({
      search: {
        page: value,
        queryId: undefined,
        nodeId: undefined,
      },
    });
  };
  const setQueryId = (value: number | undefined) => {
    resetState();
    void navigate({
      search: {
        queryId: value,
        nodeId: undefined,
      },
    });
  };
  const setNodeId = (value: number | undefined) =>
    void navigate({ search: { nodeId: value } });

  const setSort = (sortKey: SortKey, sortAscending: boolean) => {
    resetState();
    void navigate({
      search: {
        page: undefined,
        queryId: undefined,
        nodeId: undefined,
        sort: sortKey,
        asc: sortAscending,
      },
    });
  };

  const setExplainer = (value: ExplainerType | undefined) => {
    resetState();
    void navigate({ search: { explainer: value } });
  };

  const workloads = useGetWorkloads({ datasetId: datasetId });
  const query = useGetQuery({ queryId: queryId });
  const [minimized, setMinimized] = useState(true);

  const [selectedExplanationSection, setSelectedExplanationSection] =
    useState<ExplanationSection>('Node Ranking');

  const resetState = () => {
    setSelectedExplanationSection('Node Ranking');
  };

  const explainer = explainerParam ?? 'GradientExplainer';

  return (
    <div
      className={cn(
        'grid grid-rows-1 gap-x-4 overflow-hidden',
        minimized ? 'grid-demo-collapsed' : 'grid-demo',
      )}
    >
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Query Selection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 overflow-hidden px-0 py-2">
          <div className="flex gap-2 px-2">
            <DatasetSelect
              className="w-9 grow"
              datasetId={datasetId}
              setDatasetId={setDatasetId}
            />
            {datasetId != undefined && (
              <WorkloadSelect
                className="w-9 grow"
                datasetId={datasetId}
                workloadId={workloadId}
                setWorkloadId={setWorkloadId}
              />
            )}
            {!workloads.isSuccess && <div className="w-9 grow px-3"></div>}
            {workloadId != undefined && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMinimized(!minimized)}
              >
                {minimized ? (
                  <ArrowRightFromLine className="size-4" />
                ) : (
                  <ArrowLeftToLine className="size-4" />
                )}
              </Button>
            )}
          </div>

          {workloadId != undefined && (
            <QueryList
              minimized={minimized}
              workloadId={workloadId}
              queryId={queryId}
              setQueryId={setQueryId}
              page={page}
              setPage={setPage}
              sortKey={sortKey}
              sortAscending={sortAscending}
              setSort={setSort}
            ></QueryList>
          )}
        </CardContent>
      </Card>
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
          <Card
            className="flex h-full w-full flex-col"
            onClick={() => setNodeId(undefined)}
          >
            <CardHeader className="flex-shrink-0">
              <CardTitle>Query Graph</CardTitle>
            </CardHeader>
            {query.isSuccess && (
              <QueryGraph
                fullPlan={query.data}
                nodeId={nodeId}
                setNodeId={setNodeId}
              />
            )}
          </Card>
        )}
      </div>
      {queryId != undefined && (
        <div className="flex grow flex-col gap-4 overflow-hidden">
          <PredictionCard queryId={queryId} />
          <Card className="flex grow flex-col overflow-hidden">
            <CardHeader className="flex flex-col gap-3">
              <CardTitle>Explanations</CardTitle>
              <ExplainerSelect
                explainer={explainer}
                setExplainer={setExplainer}
              />
            </CardHeader>
            <CardContent className="flex grow flex-col overflow-hidden px-0 py-0">
              {
                <ScrollArea>
                  <Tabs
                    defaultValue="Node Ranking"
                    value={selectedExplanationSection}
                    onValueChange={(value) =>
                      setSelectedExplanationSection(value as ExplanationSection)
                    }
                  >
                    <TabsList className="mx-4 grid h-16 grid-cols-3 gap-x-2 px-2">
                      {explanationSections.map((section) => (
                        <TabsTrigger
                          className="text-wrap whitespace-normal"
                          value={section}
                        >
                          {section}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value="Node Ranking">
                      <ExplanationCard
                        key={`explanation-${explainer}`}
                        explainerType={explainer}
                        queryId={queryId}
                        nodeId={nodeId}
                        setNodeId={setNodeId}
                      />
                    </TabsContent>
                    <TabsContent value="Runtime Correlation">
                      {insertSeparators(
                        baseExplainerInfos.map((baseExplainerInfo) => (
                          <CorrelationBarsCard
                            key={`correlation-${baseExplainerInfo.explainerType}`}
                            baseExplainersType={baseExplainerInfo.explainerType}
                            explainerTypes={[
                              baseExplainerInfo.explainerType,
                              explainer,
                            ]}
                            queryId={queryId}
                            nodeId={nodeId}
                            setNodeId={setNodeId}
                          ></CorrelationBarsCard>
                        )),
                      )}
                    </TabsContent>
                    <TabsContent value="Explainer Evaluation">
                      <SingleExplainerEvaluationCard
                        queryId={queryId}
                        explainerType={explainer}
                      ></SingleExplainerEvaluationCard>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
              }
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
