import { getPrediction } from '@/api/demo';
import { round } from '@/lib/round';
import { useDemoStore } from '@/stores/demoStore';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';

export default function PredictionCard() {
  const queryId = useDemoStore(useShallow((store) => store.queryId));
  const prediction = useQuery({
    queryKey: ['prediction', queryId],
    queryFn: () =>
      queryId == undefined ? Promise.resolve(null) : getPrediction(queryId),
    staleTime: Infinity,
    gcTime: 0,
  });

  return (
    queryId != undefined && (
      <Card>
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
