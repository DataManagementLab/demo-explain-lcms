import { getQueries } from '@/api/demo';
import { useDemoStore } from '@/stores/demoStore';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function QueryList() {
  const workloadId = useDemoStore(useShallow((state) => state.workloadId));
  const queries = useQuery({
    queryKey: ['queries', workloadId],
    queryFn: () => getQueries(workloadId!),
    enabled: workloadId != undefined,
  });

  console.log('Render QueryList');

  return (
    queries.isSuccess && (
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">ID</TableHead>
                <TableHead className="">Plan Nodes</TableHead>
                <TableHead className="">Data Nodes</TableHead>
                <TableHead className="">Other Nodes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.data.map((query) => (
                <TableRow key={query.id}>
                  <TableCell className="">{query.id}</TableCell>
                  <TableCell className="">
                    Total: {query.queryStats.plans}; Joins:{' '}
                    {query.queryStats.joins}
                  </TableCell>
                  <TableCell className="">
                    Tables: {query.queryStats.tables}; Columns{' '}
                    {query.queryStats.columns}
                  </TableCell>
                  <TableCell className="">
                    Predicates: {query.queryStats.predicates}; Order By:{' '}
                    {query.queryStats.orderBy ? 'Yes' : 'No'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end gap-2 py-4">
          <div className="pr-3 text-sm text-muted-foreground">Page 1 of 20</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Prev')}
            disabled={false}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Next')}
            disabled={false}
          >
            Next
          </Button>
        </div>
      </div>
    )
  );
}
