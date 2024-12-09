import React, { useEffect, useState } from 'react';
import { CorrelationType } from '@/api/data/evaluation';
import { ExplainerType } from '@/api/data/inference';
import { useGetPrediction } from '@/api/inference';
import { useGetQuery, useGetWorkloads } from '@/api/queries';
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
import { WorkloadSelect } from '@/components/demo/WorkloadSelect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useDemoStore } from '@/stores/demoStore';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeftToLine, ArrowRightFromLine } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

export const Route = createFileRoute('/demo')({
  component: Demo,
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
] satisfies ExplainerType[];

const explanainerTypes = [
  ...baseExplainerTypes,
  ...realExplainers,
] satisfies ExplainerType[];

const nodeIdToColor = new Map<number, string>();

function Demo() {
  const [
    datasetId,
    workloadId,
    queryId,
    showExplanations,
    setSelectedNodeId,
    toggleExplanaitons,
  ] = useDemoStore(
    useShallow((state) => [
      state.datasetId,
      state.workloadId,
      state.queryId,
      state.showExplanations,
      state.setSelectedNodeId,
      state.toggleExplanaitons,
    ]),
  );
  const workloads = useGetWorkloads({ datasetId: datasetId });
  const query = useGetQuery({ queryId: queryId });
  const prediction = useGetPrediction({ queryId: queryId });
  const [minimized, setMinimized] = useState(true);

  useEffect(() => nodeIdToColor.clear(), [queryId]);

  console.log(baseExplainerInfos);

  return (
    <div className="grid grid-cols-12 gap-x-4">
      <div
        className={cn(
          'col-start-1 col-end-5 flex flex-col gap-2',
          minimized && 'col-end-3',
        )}
      >
        <div className="flex gap-2">
          <DatasetSelect className="w-9 grow" />
          <WorkloadSelect className="w-9 grow" />
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
        <QueryList minimized={minimized}></QueryList>
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
            onClick={() => setSelectedNodeId(undefined)}
          >
            {query.isSuccess && <QueryGraph fullPlan={query.data} />}
          </Card>
        )}
        <NodeInfoCard />
      </div>
      {queryId != undefined && (
        <ScrollArea className="col-start-10 col-end-13 h-[calc(100vh-56px-8px-16px)] rounded-md border">
          <div className="flex flex-col gap-1">
            <SqlCard />
            <Separator />
            <PredictionCard />
            {!showExplanations ? (
              <Button
                variant="outline"
                size="lg"
                className="self-center"
                onClick={() => toggleExplanaitons()}
                disabled={!prediction.isSuccess}
              >
                Run Explanations
              </Button>
            ) : (
              <>
                {explanainerTypes.map((explainerType) => (
                  <React.Fragment key={explainerType}>
                    <Separator />
                    <ExplanationCard explainerType={explainerType} />
                  </React.Fragment>
                ))}
                <Separator />
                <FidelityEvaluationCard
                  fidelityType="plus"
                  explainerTypes={explanainerTypes}
                />
                <Separator />
                <FidelityEvaluationCard
                  fidelityType="minus"
                  explainerTypes={explanainerTypes}
                />
                {baseExplainerInfos.map((baseExplainerInfo) => (
                  <React.Fragment key={baseExplainerInfo.explainerType}>
                    <Separator />
                    <CorrelationBarsCard
                      baseExplainersType={baseExplainerInfo.explainerType}
                      explainerTypes={[
                        baseExplainerInfo.explainerType,
                        ...realExplainers,
                      ]}
                      nodeIdToColor={nodeIdToColor}
                    ></CorrelationBarsCard>
                    <Separator />
                    <CorrelationScoreCard
                      correlationType={baseExplainerInfo.pearsonFn}
                      explainerTypes={realExplainers}
                    />
                    <Separator />
                    <CorrelationScoreCard
                      correlationType={baseExplainerInfo.spearmanFn}
                      explainerTypes={realExplainers}
                    />
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
