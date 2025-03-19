import {
  CorrelationType,
  correlationTypeToDisplay,
} from '@/api/data/evaluation';
import { ExplainerType, explainerTypeToDisplay } from '@/api/data/inference';
import { useGetCorrelaitonEvaluations } from '@/api/evaluation';
import { useGetExplanations } from '@/api/inference';
import { round } from '@/lib/round';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface Props {
  correlationType: CorrelationType;
  explainerTypes: ExplainerType[];
  queryId: number;
  modelId: number | undefined;
}

export function CorrelationScoreCard({
  correlationType,
  explainerTypes,
  queryId,
  modelId,
}: Props) {
  const explanations = useGetExplanations({
    queryId: queryId,
    explainerTypes: explainerTypes,
    modelId,
  });

  const evaluations = useGetCorrelaitonEvaluations({
    queryId: queryId,
    explanations: explanations.data,
    type: correlationType,
  });

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>
          {correlationTypeToDisplay[correlationType]} Correlation Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {evaluations.isSuccess ? (
          <Table>
            <TableBody>
              {evaluations.data.map((correlation, i) => (
                <TableRow className="hover:bg-transparent" key={i}>
                  <TableCell className="font-medium">
                    {explainerTypeToDisplay[explainerTypes[i]]}
                  </TableCell>
                  <TableCell>{round(correlation.score)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col gap-2">
            {explainerTypes.map((i) => (
              <Skeleton className="h-6" key={i} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
