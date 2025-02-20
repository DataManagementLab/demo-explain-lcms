import React, { useEffect, useState } from 'react';
import {
  CorrelationType,
  EvaluationType,
  evaluationTypeToDisplay,
} from '@/api/data/evaluation';
import { ExplainerType, explainerTypeToDisplay } from '@/api/data/inference';
import { useGetPrediction } from '@/api/inference';
import { useGetQuery, useGetWorkloads } from '@/api/queries';
import { CorrelationBarsCard } from '@/components/demo/CorrelationBarsCard';
import { CorrelationScoreCard } from '@/components/demo/CorrelationScoreCard';
import { DatasetSelect } from '@/components/demo/DatasetSelect';
import { ExplanationCard } from '@/components/demo/ExplanationCard';
import { FidelityEvaluationCard } from '@/components/demo/FidelityEvaluationCard';
import { LabeledSwitch } from '@/components/demo/LabeledSwitch';
import { NodeInfoCard } from '@/components/demo/NodeInfoCard';
import { PredictionCard } from '@/components/demo/PredictionCard';
import { QueryGraph } from '@/components/demo/QueryGraph';
import { QueryList } from '@/components/demo/QueryList';
import { SqlCard } from '@/components/demo/SqlCard';
import { WorkloadSelect } from '@/components/demo/WorkloadSelect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

interface SelectedInfo<T> {
  item: T;
  isSelected: boolean;
}

type SelectedInfoKey = 'selectedExplainers' | 'selectedEvaluations';

function useSelectedInfo<T>(key: SelectedInfoKey, initialItems: T[]) {
  const storedSelectedStr = localStorage.getItem(key);
  const storedSelected = storedSelectedStr
    ? (JSON.parse(storedSelectedStr) as SelectedInfo<T>[])
    : undefined;
  const [selected, setSelected] = useState(
    storedSelected != undefined && storedSelected.length == initialItems.length
      ? storedSelected
      : initialItems.map(
          (item) =>
            ({
              item: item,
              isSelected: true,
            }) satisfies SelectedInfo<T>,
        ),
  );

  useEffect(
    () => localStorage.setItem(key, JSON.stringify(selected)),
    [selected],
  );

  const setSelectedItem = (item: T, value: boolean) => {
    return setSelected(
      selected.map((i) =>
        i.item != item
          ? i
          : {
              item: item,
              isSelected: value,
            },
      ),
    );
  };

  return [selected, setSelectedItem] as const;
}

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

function Demo() {
  const navigate = useNavigate({ from: Route.fullPath });

  const { datasetId, workloadId, page, queryId, nodeId } = Route.useSearch();
  const setDatasetId = (value: number | undefined) => {
    setShowExplanations(false);
    void navigate({
      to: '/demo',
      search: {
        datasetId: value,
        workloadId: undefined,
        page: undefined,
        queryId: undefined,
        nodeId: undefined,
      },
    });
  };
  const setWorkloadId = (value: number | undefined) => {
    setShowExplanations(false);
    void navigate({
      search: {
        workloadId: value,
        page: undefined,
        queryId: undefined,
        nodeId: undefined,
      },
    });
  };
  const setPage = (value: number) => {
    setShowExplanations(false);
    void navigate({
      search: {
        page: value,
        queryId: undefined,
        nodeId: undefined,
      },
    });
  };
  const setQueryId = (value: number | undefined) => {
    setShowExplanations(false);
    void navigate({
      search: {
        queryId: value,
        nodeId: undefined,
      },
    });
  };
  const setNodeId = (value: number | undefined) =>
    void navigate({ search: { nodeId: value } });

  const [showExplanations, setShowExplanations] = useState(false);
  const workloads = useGetWorkloads({ datasetId: datasetId });
  const query = useGetQuery({ queryId: queryId });
  const prediction = useGetPrediction({ queryId: queryId });
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

  return (
    <div className="grid grid-cols-12 gap-x-4">
      <div
        className={cn(
          'col-start-1 col-end-5 flex flex-col gap-2',
          minimized && 'col-end-3',
        )}
      >
        <div className="flex gap-2">
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
              variant="outline"
              size="icon"
              onClick={() => setMinimized(!minimized)}
            >
              {minimized ? (
                <ArrowRightFromLine className="h-4 w-4" />
              ) : (
                <ArrowLeftToLine className="h-4 w-4" />
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
          ></QueryList>
        )}
      </div>
      <div
        className={cn(
          'col-start-5 col-end-10 flex flex-col gap-4',
          minimized && 'col-start-3',
        )}
      >
        {queryId != undefined && (
          <Card
            className="h-[65vh] w-full"
            onClick={() => setNodeId(undefined)}
          >
            {query.isSuccess && (
              <QueryGraph
                fullPlan={query.data}
                nodeId={nodeId}
                setNodeId={setNodeId}
              />
            )}
          </Card>
        )}
        {queryId != undefined && nodeId != undefined && (
          <NodeInfoCard queryId={queryId} nodeId={nodeId} />
        )}
      </div>
      {queryId != undefined && (
        <ScrollArea className="col-start-10 col-end-13 h-[var(--main-height)] rounded-md border">
          <div className="flex flex-col gap-1">
            <SqlCard queryId={queryId} />
            <Separator />
            <PredictionCard queryId={queryId} />
            <div className="mt-6 grid">
              {!showExplanations ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="col-start-1 row-start-1 h-9 justify-self-center"
                  onClick={() => setShowExplanations(true)}
                  disabled={!prediction.isSuccess}
                >
                  Run Explanations
                </Button>
              ) : (
                <h3 className="col-start-1 row-start-1 self-center justify-self-center text-xl">
                  Explanations
                </h3>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="col-start-1 row-start-1 mr-2 justify-self-end"
                    size="icon"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="flex flex-col">
                    <h4>Explainers</h4>
                    <Separator className="mt-0.5 mb-2"></Separator>
                    <div className="flex flex-col gap-1">
                      {selectedExplainers.map((explainer) => (
                        <LabeledSwitch
                          key={explainer.item}
                          id={explainer.item}
                          label={explainerTypeToDisplay[explainer.item]}
                          checked={explainer.isSelected}
                          onCheckedChange={(value) => {
                            toggleSelectedExplainer(explainer.item, value);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {showExplanations && (
              <>
                {selectedExplainerTypes.map((explainerType) => (
                  <React.Fragment key={explainerType}>
                    <Separator />
                    <ExplanationCard
                      explainerType={explainerType}
                      queryId={queryId}
                      nodeId={nodeId}
                      setNodeId={setNodeId}
                    />
                  </React.Fragment>
                ))}
                <div className="mt-6 grid">
                  <h3 className="col-start-1 row-start-1 self-center justify-self-center text-xl">
                    Evaluations
                  </h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="col-start-1 row-start-1 mr-2 justify-self-end"
                        size="icon"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="flex flex-col">
                        <h4>Explainers</h4>
                        <Separator className="mt-0.5 mb-2"></Separator>
                        <div className="flex flex-col gap-1">
                          {selectedEvaluations.map((evaluation) => (
                            <LabeledSwitch
                              key={evaluation.item}
                              id={evaluation.item}
                              label={evaluationTypeToDisplay[evaluation.item]}
                              checked={evaluation.isSelected}
                              onCheckedChange={(value) => {
                                toggleSelectedEvaluation(
                                  evaluation.item,
                                  value,
                                );
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                {selectedEvaluationTypes.includes('fidelity-plus') && (
                  <>
                    <Separator />
                    <FidelityEvaluationCard
                      fidelityType="fidelity-plus"
                      explainerTypes={selectedExplainerTypes}
                      queryId={queryId}
                    />
                  </>
                )}
                {selectedEvaluationTypes.includes('fidelity-minus') && (
                  <>
                    <Separator />
                    <FidelityEvaluationCard
                      fidelityType="fidelity-minus"
                      explainerTypes={selectedExplainerTypes}
                      queryId={queryId}
                    />
                  </>
                )}
                {selectedEvaluationTypes.includes('characterization-score') && (
                  <>
                    <Separator />
                    <FidelityEvaluationCard
                      fidelityType="characterization-score"
                      explainerTypes={selectedExplainerTypes}
                      queryId={queryId}
                    />
                  </>
                )}
                {baseExplainerInfos.map((baseExplainerInfo) => (
                  <React.Fragment key={baseExplainerInfo.explainerType}>
                    {(selectedEvaluationTypes.includes(
                      baseExplainerInfo.pearsonFn,
                    ) ||
                      selectedEvaluationTypes.includes(
                        baseExplainerInfo.spearmanFn,
                      )) && (
                      <>
                        <Separator />
                        <CorrelationBarsCard
                          baseExplainersType={baseExplainerInfo.explainerType}
                          explainerTypes={[
                            baseExplainerInfo.explainerType,
                            ...selectedRealExplainers,
                          ]}
                          queryId={queryId}
                          nodeId={nodeId}
                          setNodeId={setNodeId}
                        ></CorrelationBarsCard>
                      </>
                    )}
                    {selectedEvaluationTypes.includes(
                      baseExplainerInfo.pearsonFn,
                    ) && (
                      <>
                        <Separator />
                        <CorrelationScoreCard
                          correlationType={baseExplainerInfo.pearsonFn}
                          explainerTypes={selectedRealExplainers}
                          queryId={queryId}
                        />
                      </>
                    )}
                    {selectedEvaluationTypes.includes(
                      baseExplainerInfo.spearmanFn,
                    ) && (
                      <>
                        <Separator />
                        <CorrelationScoreCard
                          correlationType={baseExplainerInfo.spearmanFn}
                          explainerTypes={selectedRealExplainers}
                          queryId={queryId}
                        />
                      </>
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
