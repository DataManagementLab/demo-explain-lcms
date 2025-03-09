import { JSX, useState } from 'react';
import {
  CorrelationType,
  EvaluationType,
  evaluationTypeToDisplay,
  isCorrelationType,
  isFidelityType,
} from '@/api/data/evaluation';
import { ExplainerType, explainerTypeToDisplay } from '@/api/data/inference';
import { SortKey, sortKeys, useGetQuery, useGetWorkloads } from '@/api/queries';
import { CorrelationBarsCard } from '@/components/demo/CorrelationBarsCard';
import { CorrelationScoreCard } from '@/components/demo/CorrelationScoreCard';
import { DatasetSelect } from '@/components/demo/DatasetSelect';
import { ExplanationCard } from '@/components/demo/ExplanationCard';
import { FidelityEvaluationCard } from '@/components/demo/FidelityEvaluationCard';
import { NodeInfoCard } from '@/components/demo/NodeInfoCard';
import { PredictionCard } from '@/components/demo/PredictionCard';
import { QueryGraph } from '@/components/demo/QueryGraph';
import { QueryList } from '@/components/demo/QueryList';
import { SqlCard } from '@/components/demo/SqlCard';
import { TogglesForSelectedInfo } from '@/components/demo/TogglesForSelectedInfo';
import { WorkloadSelect } from '@/components/demo/WorkloadSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSelectedInfo } from '@/lib/useSelectedInfo';
import { cn } from '@/lib/utils';
import {
  createFileRoute,
  retainSearchParams,
  useNavigate,
} from '@tanstack/react-router';
import { ArrowLeftToLine, ArrowRightFromLine, Settings } from 'lucide-react';
import { z } from 'zod';

const demoPageParamsSchema = z.object({
  datasetId: z.number().positive().optional(),
  workloadId: z.number().positive().optional(),
  page: z.number().nonnegative().optional(),
  queryId: z.number().positive().optional(),
  nodeId: z.number().positive().optional(),
  sort: z.enum(sortKeys).optional(),
  asc: z.boolean().optional(),
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
    explainerType: ExplainerType.baseRuntime,
    pearsonFn: 'pearson',
    spearmanFn: 'spearman',
  },
  {
    explainerType: ExplainerType.baseCardinality,
    pearsonFn: 'pearson-cardinality',
    spearmanFn: 'spearman-cardinality',
  },
  {
    explainerType: ExplainerType.baseNodeDepth,
    pearsonFn: 'pearson-node-depth',
    spearmanFn: 'spearman-node-depth',
  },
] satisfies BaseExplainerInfo[];

const baseExplainerTypes = baseExplainerInfos.map((info) => info.explainerType);

const realExplainers = [
  ExplainerType.gradient,
  ExplainerType.guidedBackpropagation,
  ExplainerType.gnnExplainer,
  ExplainerType.gnnExplainerOnlyPlans,
  ExplainerType.differenceExplainer,
  ExplainerType.differenceExplainerOnlyPlans,
] satisfies ExplainerType[] as ExplainerType[];

const explainerTypes = [
  ...baseExplainerTypes,
  ...realExplainers,
] satisfies ExplainerType[];

const evaluations = [
  'fidelity-plus',
  'fidelity-minus',
  'characterization-score',
  'pearson',
  'spearman',
  'pearson-cardinality',
  'spearman-cardinality',
  'pearson-node-depth',
  'spearman-node-depth',
] satisfies EvaluationType[];

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

  const workloads = useGetWorkloads({ datasetId: datasetId });
  const query = useGetQuery({ queryId: queryId });
  const [minimized, setMinimized] = useState(true);

  const [selectedExplainers, toggleSelectedExplainer] = useSelectedInfo(
    'selectedExplainers',
    explainerTypes,
  );
  const selectedExplainerTypes = selectedExplainers
    .filter((e) => e.isSelected)
    .map((e) => e.item);

  const selectedRealExplainers = selectedExplainerTypes.filter((e) =>
    realExplainers.includes(e),
  );

  const [selectedEvaluations, toggleSelectedEvaluation] = useSelectedInfo(
    'selectedEvaluations',
    evaluations,
  );
  const selectedEvaluationTypes = selectedEvaluations
    .filter((e) => e.isSelected)
    .map((e) => e.item);

  const [selectedExplanationSection, setSelectedExplanationSection] =
    useState<ExplanationSection>('Node Ranking');

  const resetState = () => {
    setSelectedExplanationSection('Node Ranking');
  };

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
            <CardHeader>
              <CardTitle>
                Explanations
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="col-start-1 row-start-1 justify-self-end"
                      size="icon"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="grid grid-cols-2 gap-4">
                      <TogglesForSelectedInfo
                        title="Explainers"
                        selectedInfos={selectedExplainers}
                        toggleSelectedInfo={toggleSelectedExplainer}
                        displayStrings={explainerTypeToDisplay}
                      ></TogglesForSelectedInfo>
                      <TogglesForSelectedInfo
                        title="Evaluations"
                        selectedInfos={selectedEvaluations}
                        toggleSelectedInfo={toggleSelectedEvaluation}
                        displayStrings={evaluationTypeToDisplay}
                      ></TogglesForSelectedInfo>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex grow flex-col overflow-hidden px-0 py-0">
              <div className="grid gap-4 px-4 py-0">
                <div className="mb-0 flex w-full border-b border-gray-300 text-sm">
                  {explanationSections.map((section) => (
                    <button
                      key={section}
                      className={`flex-grow rounded-t-md border-t border-r border-l border-gray-300 px-4 py-2 ${
                        selectedExplanationSection === section
                          ? 'bg-card-foreground border-b-0 text-white'
                          : 'bg-white text-gray-700'
                      }`}
                      onClick={() => setSelectedExplanationSection(section)}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>
              {
                <ScrollArea>
                  {selectedExplanationSection == 'Node Ranking' &&
                    insertSeparators(
                      selectedExplainerTypes.map((explainerType) => (
                        <ExplanationCard
                          key={`explanation-${explainerType}`}
                          explainerType={explainerType}
                          queryId={queryId}
                          nodeId={nodeId}
                          setNodeId={setNodeId}
                        />
                      )),
                    )}
                  {selectedExplanationSection == 'Runtime Correlation' &&
                    insertSeparators(
                      baseExplainerInfos
                        .filter(
                          (baseExplainerInfo) =>
                            selectedEvaluationTypes.includes(
                              baseExplainerInfo.pearsonFn,
                            ) ||
                            selectedEvaluationTypes.includes(
                              baseExplainerInfo.spearmanFn,
                            ),
                        )
                        .map((baseExplainerInfo) => (
                          <CorrelationBarsCard
                            key={`correlation-${baseExplainerInfo.explainerType}`}
                            baseExplainersType={baseExplainerInfo.explainerType}
                            explainerTypes={[
                              baseExplainerInfo.explainerType,
                              ...selectedRealExplainers,
                            ]}
                            queryId={queryId}
                            nodeId={nodeId}
                            setNodeId={setNodeId}
                          ></CorrelationBarsCard>
                        )),
                    )}
                  {selectedExplanationSection == 'Explainer Evaluation' &&
                    insertSeparators(
                      selectedEvaluationTypes.map((evaluationType) =>
                        isCorrelationType(evaluationType) ? (
                          <CorrelationScoreCard
                            key={evaluationType}
                            correlationType={evaluationType}
                            explainerTypes={selectedRealExplainers}
                            queryId={queryId}
                          ></CorrelationScoreCard>
                        ) : isFidelityType(evaluationType) ? (
                          <FidelityEvaluationCard
                            key={evaluationType}
                            fidelityType={evaluationType}
                            explainerTypes={selectedExplainerTypes}
                            queryId={queryId}
                          ></FidelityEvaluationCard>
                        ) : (
                          <></>
                        ),
                      ),
                    )}
                </ScrollArea>
              }
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
