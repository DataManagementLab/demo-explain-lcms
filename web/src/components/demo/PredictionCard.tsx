import { useGetPrediction } from '@/api/inference';
import { getGreenRedRGB } from '@/lib/getGreenRedRGB';
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
  modelId: number | undefined;
}

export function PredictionCard({ queryId, modelId }: Props) {
  const prediction = useGetPrediction({ queryId: queryId, modelId: modelId });

  return (
    <Card className="max-h-44 min-h-44">
      <CardHeader>
        <CardTitle>Cost Prediction</CardTitle>
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
                    color: getGreenRedRGB(prediction.data.qerror - 1),
                  }}
                >
                  {round(prediction.data.qerror)}
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
