import { useGetPrediction } from '@/api/inference';
import { round } from '@/lib/round';
import { useDemoStore } from '@/stores/demoStore';
import { useShallow } from 'zustand/react/shallow';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

export function PredictionCard() {
  const queryId = useDemoStore(useShallow((state) => state.queryId));
  const prediction = useGetPrediction({ queryId: queryId });

  return (
    queryId != undefined && (
      <Card className="border-none">
        <CardHeader className="p-0 px-6 pb-2 pt-6">
          <CardTitle>Prediction</CardTitle>
          <CardDescription>
            {prediction.isSuccess
              ? `${round(prediction.data.executionTime)} s`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {prediction.isSuccess ? (
            <Table>
              <TableBody>
                <TableRow className="hover:bg-background">
                  <TableCell className="font-medium">Actual Runtime</TableCell>
                  <TableCell>{round(prediction.data.label)}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-background">
                  <TableCell className="font-medium">Prediction</TableCell>
                  <TableCell>{round(prediction.data.prediction)}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-background">
                  <TableCell className="font-medium">QError</TableCell>
                  <TableCell>{round(prediction.data.qerror)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <>
              <Skeleton className="my-2 h-6" />
              <Skeleton className="my-2 h-6" />
              <Skeleton className="my-2 h-6" />
            </>
          )}
        </CardContent>
      </Card>
    )
  );
}
