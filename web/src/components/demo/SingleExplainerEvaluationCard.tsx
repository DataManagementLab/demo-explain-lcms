import {
  correlationTypes,
  correlationTypeToDisplay,
  evaluationTypes,
  fidelityTypes,
  fidelityTypeToDisplay,
} from '@/api/data/evaluation';
import { ExplainerType } from '@/api/data/inference';
import {
  useGetCorrelationEvaluationsAllTypes,
  useGetFidelityEvaluationsAllTypes,
} from '@/api/evaluation';
import { useGetExplanation } from '@/api/inference';
import { round } from '@/lib/round';

import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface Props {
  queryId: number;
  explainerType: ExplainerType;
}

export function SingleExplainerEvaluationCard({
  queryId,
  explainerType,
}: Props) {
  const explanations = useGetExplanation({
    queryId: queryId,
    explainerType: explainerType,
  });

  const fidelityEvaluations = useGetFidelityEvaluationsAllTypes({
    queryId: queryId,
    explanation: explanations.data,
  });

  const correlationEvaluations = useGetCorrelationEvaluationsAllTypes({
    queryId: queryId,
    explanation: explanations.data,
  });

  return (
    <Card className="border-none">
      <CardContent>
        {fidelityEvaluations.isSuccess && correlationEvaluations.isSuccess ? (
          <Table>
            <TableBody>
              {fidelityTypes.map((fidelityType, i) => (
                <TableRow className="hover:bg-transparent" key={fidelityType}>
                  <TableCell className="font-medium">
                    {fidelityTypeToDisplay[fidelityType]}
                  </TableCell>
                  <TableCell>
                    {round(fidelityEvaluations.data[i].score)}
                  </TableCell>
                </TableRow>
              ))}
              {correlationTypes.map((correlationType, i) => (
                <TableRow
                  className="hover:bg-transparent"
                  key={correlationType}
                >
                  <TableCell className="font-medium">
                    {correlationTypeToDisplay[correlationType]}
                  </TableCell>
                  <TableCell>
                    {round(correlationEvaluations.data[i].score)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col gap-2">
            {evaluationTypes.map((i) => (
              <Skeleton className="h-6" key={i} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
