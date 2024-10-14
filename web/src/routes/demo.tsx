import DatasetSelect from '@/components/demo/DatasetSelect';
import QueryList from '@/components/demo/QueryList';
import WorkloadSelect from '@/components/demo/WorkloadSelect';
import { useDemoStore } from '@/stores/demoStore';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useShallow } from 'zustand/react/shallow';

export const Route = createFileRoute('/demo')({
  component: Demo,
});

function Demo() {
  const datasetId = useDemoStore(useShallow((state) => state.datasetId));
  const workloads = useQuery({
    queryKey: ['workloads', datasetId],
    enabled: datasetId != undefined,
  });

  return (
    <div className="flex">
      <div className="flex w-[600px] flex-col gap-2">
        <div className="col-span-1 flex gap-2">
          <DatasetSelect className="grow" />
          <WorkloadSelect className="grow" />
          {!workloads.isSuccess && <div className="w-full grow px-3"></div>}
        </div>
        <QueryList></QueryList>
      </div>
    </div>
  );
}
