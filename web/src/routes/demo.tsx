import { getQuery } from '@/api/demo';
import DatasetSelect from '@/components/demo/DatasetSelect';
import PredictionCard from '@/components/demo/PredictionCard';
import QueryGraph from '@/components/demo/QueryGraph';
import QueryList from '@/components/demo/QueryList';
import WorkloadSelect from '@/components/demo/WorkloadSelect';
import { Card } from '@/components/ui/card';
import { useDemoStore } from '@/stores/demoStore';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useShallow } from 'zustand/react/shallow';

export const Route = createFileRoute('/demo')({
  component: Demo,
});

function Demo() {
  const [datasetId, queryId] = useDemoStore(
    useShallow((state) => [state.datasetId, state.queryId]),
  );
  const workloads = useQuery({
    queryKey: ['workloads', datasetId],
    enabled: datasetId != undefined,
  });

  const query = useQuery({
    queryKey: ['query', queryId],
    queryFn: () =>
      queryId == undefined ? Promise.resolve(null) : getQuery(queryId),
  });

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
      <div className="col-start-5 col-end-10 flex">
        {query.data && (
          <Card className="h-[600px] w-full shadow-none">
            <QueryGraph fullPlan={query.data} />
          </Card>
        )}
      </div>
      <div className="col-start-10 col-end-13 flex-col gap-8">
        <PredictionCard />
      </div>
    </div>
  );
}
