import { useState } from 'react';
import { ExplainerType, explainerTypes } from '@/api/data/inference';
import { SortKey, sortKeys } from '@/api/queries';
import { DemoExplanationContent } from '@/components/demo/DemoExplanationContent';
import { DemoGraphContent } from '@/components/demo/DemoGraphContent';
import { DemoSelects } from '@/components/demo/DemoSelects';
import { PredictionCard } from '@/components/demo/PredictionCard';
import { QueryList } from '@/components/demo/QueryList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExplanationSection } from '@/lib/ExplanationSection';
import { cn } from '@/lib/utils';
import {
  createFileRoute,
  retainSearchParams,
  useNavigate,
} from '@tanstack/react-router';
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
  graphViewMode: z.enum(['nodeTypes', 'actualRuntimes', 'nodeImportance']).optional()
});

export const Route = createFileRoute('/demo')({
  component: Demo,
  validateSearch: demoPageParamsSchema,
  search: {
    middlewares: [retainSearchParams(true)],
  },
});

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
    graphViewMode: drawGraphViewMode,
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

  const setExplainer = (value: ExplainerType) => {
    resetState();
    void navigate({ search: { explainer: value } });
  };

const setGraphViewMode = (value: 'nodeTypes' | 'actualRuntimes' | 'nodeImportance') => {
  void navigate({ search: { graphViewMode: value } });
};

  const [minimized, setMinimized] = useState(true);

  const [selectedExplanationSection, setSelectedExplanationSection] =
    useState<ExplanationSection>('Node Ranking');

  const resetState = () => {
    setSelectedExplanationSection('Node Ranking');
  };

  const explainer = explainerParam ?? 'GradientExplainer';
  const graphViewMode: 'nodeTypes' | 'actualRuntimes' | 'nodeImportance' = drawGraphViewMode ?? 'nodeTypes';

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
          <DemoSelects
            datasetId={datasetId}
            setDatasetId={setDatasetId}
            workloadId={workloadId}
            setWorkloadId={setWorkloadId}
            minimized={minimized}
            setMinimized={setMinimized}
          />
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

      <DemoGraphContent
        queryId={queryId}
        nodeId={nodeId}
        setNodeId={setNodeId}
        setGraphViewMode={setGraphViewMode}
        graphViewMode={graphViewMode}
        explainer={explainer}
      />

      {queryId != undefined && (
        <div className="flex grow flex-col gap-4 overflow-hidden">
          <PredictionCard queryId={queryId} />
          <DemoExplanationContent
            explainer={explainer}
            setExplainer={setExplainer}
            explanationSection={selectedExplanationSection}
            setExplanationSection={setSelectedExplanationSection}
            queryId={queryId}
            nodeId={nodeId}
            setNodeId={setNodeId}
          />
        </div>
      )}
    </div>
  );
}
