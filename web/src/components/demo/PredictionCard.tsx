import { useGetPrediction } from '@/api/inference';
import { round } from '@/lib/round';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface Props {
  queryId: number;
}

export function PredictionCard({ queryId }: Props) {
  const prediction = useGetPrediction({ queryId: queryId });

  return (
    <Card>
      <CardHeader>
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
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">Actual Runtime</TableCell>
                <TableCell>{round(prediction.data.label)}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">Prediction</TableCell>
                <TableCell>{round(prediction.data.prediction)}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">QError</TableCell>
                <TableCell>{round(prediction.data.qerror)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <>
            <Skeleton className="my-2.5 h-6" />
            <Skeleton className="my-2.5 h-6" />
            <Skeleton className="my-2.5 h-6" />
            <div className="pt-0.5"></div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
