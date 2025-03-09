import { useGetPrediction } from '@/api/inference';
import { round } from '@/lib/round';

import {
  Card,
  CardContent /*CardDescription*/,
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
    <Card className="max-h-44 min-h-44">
      <CardHeader>
        <CardTitle>Cost Prediction</CardTitle>
        {/*<CardDescription>
          {prediction.isSuccess
            ? `${round(prediction.data.executionTime)} s`
            : ''}
        </CardDescription>*/}
      </CardHeader>
      <CardContent className="flex flex-col">
        {prediction.isSuccess ? (
          <Table>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">
                  Actual Runtime (s)
                </TableCell>
                <TableCell>{round(prediction.data.label)}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">
                  Predicted Runtime (s)
                </TableCell>
                <TableCell>{round(prediction.data.prediction)}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">Q-Error</TableCell>
                <TableCell
                  className="font-bold"
                  style={{
                    color: `rgb(${Math.min(255, (prediction.data.qerror - 1) * 255)}, ${Math.max(0, 255 - (prediction.data.qerror - 1) * 255)}, 0)`,
                  }}
                >
                  {prediction.data.qerror.toFixed(2)}
                </TableCell>
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
  );
}
