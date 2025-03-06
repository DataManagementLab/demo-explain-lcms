import { useRef } from 'react';
import { SortKey, useGetQueries } from '@/api/queries';
import { round } from '@/lib/round';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { HeaderSortButton } from './HeaderSortButton';

const pageSize = 50;

interface Props {
  minimized: boolean;
  workloadId: number;
  queryId: number | undefined;
  setQueryId: (value: number) => void;
  page: number | undefined;
  setPage: (value: number) => void;
  sortKey: SortKey | undefined;
  sortAscending: boolean | undefined;
  setSort: (sortKey: SortKey, sortAscending: boolean) => void;
}

export function QueryList({
  minimized,
  workloadId,
  page: pageInput,
  setPage,
  queryId,
  setQueryId,
  sortKey: sortKeyInput,
  sortAscending: sortAscendingInput,
  setSort,
}: Props) {
  const page = pageInput ?? 0;
  const sortKey = sortKeyInput ?? 'id';
  const sortAscending = sortAscendingInput ?? true;
  const queries = useGetQueries({
    workloadId: workloadId,
    offset: page * pageSize,
    limit: pageSize,
    sortKey: sortKey,
    sortAscending: sortAscending,
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

  const HeaderButton = (props: { text: string; sortKey: SortKey }) => (
    <HeaderSortButton
      text={props.text}
      sortKey={props.sortKey}
      currentSortKey={sortKey}
      currentAscending={sortAscending}
      sortChanged={setSort}
    />
  );

  return (
    queries.isSuccess && (
      <div className="flex flex-col overflow-hidden">
        <ScrollArea ref={scrollArea}>
          <Table>
            <TableHeader className="bg-card sticky top-0">
              <TableRow>
                <TableHead className="border-r text-center">
                  <HeaderButton text="ID" sortKey="id"></HeaderButton>
                </TableHead>
                <TableHead className="border-r text-center">
                  <HeaderButton
                    text="Runtime(s)"
                    sortKey="runtime"
                  ></HeaderButton>
                </TableHead>
                <TableHead className="border-l text-center">
                  <HeaderButton text="Operators" sortKey="plans"></HeaderButton>
                </TableHead>
                <TableHead className={cn('border-r border-l text-center')}>
                  <HeaderButton text="Nodes" sortKey="nodes"></HeaderButton>
                </TableHead>
                {!minimized && (
                  <>
                    <TableHead className="border-l text-center">
                      <HeaderButton text="Joins" sortKey="joins"></HeaderButton>
                    </TableHead>
                    <TableHead className="border-l text-center">
                      <HeaderButton
                        text="Tables"
                        sortKey="tables"
                      ></HeaderButton>
                    </TableHead>
                    <TableHead className="border-r text-center">
                      <HeaderButton
                        text="Columns"
                        sortKey="columns"
                      ></HeaderButton>
                    </TableHead>
                    <TableHead className="border-r border-l text-center">
                      <HeaderButton
                        text="Predicates"
                        sortKey="predicates"
                      ></HeaderButton>
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-card overflow-y-auto">
              {queries.data.queries.map((query) => (
                <TableRow
                  key={query.id}
                  onClick={() => setQueryId(query.id)}
                  data-state={queryId == query.id ? 'selected' : ''}
                >
                  <TableCell className="border-r text-center">
                    {' '}
                    {query.idInRun}
                  </TableCell>
                  <TableCell className="border-r border-l text-center">
                    {' '}
                    {round(query.planRuntime / 1000)}
                  </TableCell>
                  <TableCell className="border-r border-l text-center">
                    {query.queryStats.plans}
                  </TableCell>
                  <TableCell className="border-r border-l text-center">
                    {query.queryStats.nodes}
                  </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <Separator></Separator>
        <div className="flex items-center justify-end gap-2 px-2 pt-2">
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
