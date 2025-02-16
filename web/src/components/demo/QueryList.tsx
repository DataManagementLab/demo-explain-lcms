import { useRef } from 'react';
import { useGetQueries } from '@/api/queries';
import { round } from '@/lib/round';
import { cn } from '@/lib/utils';

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

interface Props {
  minimized: boolean;
  workloadId: number;
  queryId: number | undefined;
  setQueryId: (value: number) => void;
  page: number | undefined;
  setPage: (value: number) => void;
}

export function QueryList({
  minimized,
  workloadId,
  page: pageInput,
  setPage,
  queryId,
  setQueryId,
}: Props) {
  const page = pageInput ?? 0;
  const queries = useGetQueries({
    workloadId: workloadId,
    offset: page * pageSize,
    limit: pageSize,
  });
  const pageLimit = queries.isSuccess
    ? Math.ceil(queries.data.totalCount / pageSize) - 1
    : 0;

  const scrollArea = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    if (scrollArea.current) {
      scrollArea.current.scrollTo({ top: 0 });
    }
  };

  return (
    queries.isSuccess && (
      <div className="flex flex-col gap-4">
        <ScrollArea
          ref={scrollArea}
          className="h-[calc(100vh-56px-36px-8px-8px-16px-32px-16px)] rounded-md border"
        >
          <Table>
            <TableHeader className="bg-secondary sticky top-0">
              <TableRow>
                <TableHead className="border-r text-center">ID</TableHead>
                <TableHead className="border-r text-center">Nodes</TableHead>
                {!minimized && (
                  <TableHead className="border-l text-center">Plans</TableHead>
                )}
                <TableHead
                  className={cn(
                    'border-r text-center',
                    minimized && 'border-l',
                  )}
                >
                  Joins
                </TableHead>
                {!minimized && (
                  <>
                    <TableHead className="border-l text-center">
                      Tables
                    </TableHead>
                    <TableHead className="border-r text-center">
                      Columns
                    </TableHead>
                    <TableHead className="border-r border-l text-center">
                      Predicates
                    </TableHead>
                  </>
                )}
                <TableHead className="border-l text-center">
                  Runtime (s)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto">
              {queries.data.queries.map((query) => (
                <TableRow
                  key={query.id}
                  onClick={() => setQueryId(query.id)}
                  data-state={queryId == query.id ? 'selected' : ''}
                >
                  <TableCell className="border-r text-center">
                    {query.idInRun}
                  </TableCell>
                  <TableCell className="border-r border-l text-center">
                    {query.queryStats.nodes}
                  </TableCell>
                  {!minimized && (
                    <TableCell className="border-l text-center">
                      {query.queryStats.plans}
                    </TableCell>
                  )}
                  <TableCell className="border-r text-center">
                    {query.queryStats.joins}
                  </TableCell>
                  {!minimized && (
                    <>
                      <TableCell className="border-l text-center">
                        {query.queryStats.tables}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {query.queryStats.columns}
                      </TableCell>
                      <TableCell className="border-r border-l text-center">
                        {query.queryStats.predicates}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="border-l text-center">
                    {round(query.planRuntime / 1000)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="flex items-center justify-end gap-2">
          <div className="text-muted-foreground max-h-8 overflow-hidden pr-3 text-sm leading-[1.1]">
            Page {page + 1} of {pageLimit + 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              scrollToTop();
              setPage(page - 1);
            }}
            disabled={page <= 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              scrollToTop();
              setPage(page + 1);
            }}
            disabled={page >= pageLimit}
          >
            Next
          </Button>
        </div>
      </div>
    )
  );
}
