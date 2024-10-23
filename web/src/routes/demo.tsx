import React from 'react';
import { ExplainerType } from '@/api/data/inference';
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
import { useDemoStore } from '@/stores/demoStore';
import { createFileRoute } from '@tanstack/react-router';
import { useShallow } from 'zustand/react/shallow';

export const Route = createFileRoute('/demo')({
  component: Demo,
});

const explanainerTypes = [
  ExplainerType.actual,
  ExplainerType.gradient,
  ExplainerType.guidedBackpropagation,
  ExplainerType.gnnExplainer,
];

function Demo() {
  const [
    datasetId,
    queryId,
    showExplanations,
    setSelectedNodeId,
    toggleExplanaitons,
  ] = useDemoStore(
    useShallow((state) => [
      state.datasetId,
      state.queryId,
      state.showExplanations,
      state.setSelectedNodeId,
      state.toggleExplanaitons,
    ]),
  );
  const workloads = useGetWorkloads({ datasetId: datasetId });
  const query = useGetQuery({ queryId: queryId });

  return (
    <div className="grid grid-cols-12 gap-x-4">
      <div className="col-start-1 col-end-5 flex flex-col gap-2">
        <div className="col-span-1 flex gap-2">
          <DatasetSelect className="grow" />
          <WorkloadSelect className="grow" />
          {!workloads.isSuccess && <div className="w-full grow px-3"></div>}
        </div>
        <QueryList></QueryList>
      </div>
      <div className="col-start-5 col-end-10 flex flex-col gap-4">
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
              >
                Run Explanations
              </Button>
            ) : (
              <>
                <Separator />
                {explanainerTypes.map((explainerType) => (
                  <React.Fragment key={explainerType}>
                    <ExplanationCard explainerType={explainerType} />
                    <Separator />
                  </React.Fragment>
                ))}
                <FidelityEvaluationCard
                  fidelityType="plus"
                  explainerTypes={explanainerTypes}
                />
                <Separator />
                <FidelityEvaluationCard
                  fidelityType="minus"
                  explainerTypes={explanainerTypes}
                />
                <Separator />
                <CorrelationBarsCard
                  explainerTypes={explanainerTypes}
                ></CorrelationBarsCard>
                <Separator />
                <CorrelationScoreCard
                  correlationType="pearson"
                  explainerTypes={explanainerTypes}
                />
                <Separator />
                <CorrelationScoreCard
                  correlationType="spearman"
                  explainerTypes={explanainerTypes}
                />
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
