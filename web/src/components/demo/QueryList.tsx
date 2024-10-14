import { useState } from 'react';
import { getQueries } from '@/api/demo';
import { useDemoStore } from '@/stores/demoStore';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const pageSize = 50;

export default function QueryList() {
  const [page, setPage] = useState<number>(0);

  const workloadId = useDemoStore(useShallow((state) => state.workloadId));
  const queries = useQuery({
    queryKey: ['queries', workloadId, page],
    queryFn: () =>
      workloadId == undefined
        ? Promise.resolve(null)
        : getQueries(workloadId, page * pageSize, pageSize),
    placeholderData: (prev) => prev,
  });
  const pageLimit =
    queries.data != undefined
      ? Math.ceil(queries.data.totalCount / pageSize) - 1
      : 0;

  const [queryId, setQueryId] = useDemoStore(
    useShallow((state) => [state.queryId, state.setQueryId]),
  );

  return (
    queries.data && (
      <div className="flex flex-col gap-4">
        <ScrollArea className="h-[700px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary">
              <TableRow>
                <TableHead className="border-r text-center">ID</TableHead>
                <TableHead className="border-l text-center">Plans</TableHead>
                <TableHead className="border-r text-center">Joins</TableHead>
                <TableHead className="border-l text-center">Tables</TableHead>
                <TableHead className="border-r text-center">Columns</TableHead>
                <TableHead className="border-l border-r text-center">
                  Predicates
                </TableHead>
                <TableHead className="border-l text-center">Sort</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="max-h-[200px] overflow-y-auto">
              {queries.data.queries.map((query) => (
                <TableRow
                  key={query.id}
                  onClick={() => setQueryId(query.id)}
                  data-state={queryId == query.id ? 'selected' : ''}
                >
                  <TableCell className="border-r text-center">
                    {query.idInRun}
                  </TableCell>
                  <TableCell className="border-l text-center">
                    {query.queryStats.plans}
                  </TableCell>
                  <TableCell className="border-r text-center">
                    {query.queryStats.joins}
                  </TableCell>
                  <TableCell className="border-l text-center">
                    {query.queryStats.tables}
                  </TableCell>
                  <TableCell className="border-r text-center">
                    {query.queryStats.columns}
                  </TableCell>
                  <TableCell className="border-l border-r text-center">
                    {query.queryStats.predicates}
                  </TableCell>
                  <TableCell className="border-l text-center">
                    {query.queryStats.orderBy ? 'Yes' : 'No'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="flex items-center justify-end gap-2">
          <div className="pr-3 text-sm text-muted-foreground">
            Page {page + 1} of {pageLimit + 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= pageLimit}
          >
            Next
          </Button>
        </div>
      </div>
    )
  );
}
