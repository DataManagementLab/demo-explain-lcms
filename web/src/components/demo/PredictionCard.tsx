import { useGetPrediction } from '@/api/inference';
import { round } from '@/lib/round';
import { useDemoStore } from '@/stores/demoStore';
import { useShallow } from 'zustand/react/shallow';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';

export default function PredictionCard() {
  const queryId = useDemoStore(useShallow((store) => store.queryId));
  const prediction = useGetPrediction({ queryId: queryId });

  return (
    queryId != undefined && (
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Prediction</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          {prediction.data ? (
            <div className="flex items-center gap-1">
              <Label>Label:</Label>
              <p>{round(prediction.data.label)}</p>
            </div>
          ) : (
            <Skeleton className="my-1 h-4" />
          )}
          {prediction.data ? (
            <div className="flex items-center gap-1">
              <Label>Prediction:</Label>
              <p>{round(prediction.data.prediction)}</p>
            </div>
          ) : (
            <Skeleton className="my-1 h-4" />
          )}
          {prediction.data ? (
            <div className="flex items-center gap-1">
              <Label>QError:</Label>
              <p>{round(prediction.data.qerror)}</p>
            </div>
          ) : (
            <Skeleton className="my-1 h-4" />
          )}
        </CardContent>
      </Card>
    )
  );
}
