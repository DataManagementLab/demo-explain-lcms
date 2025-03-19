import {
  evaluationTypes,
  fidelityTypes,
  fidelityTypeToDisplay,
} from '@/api/data/evaluation';
import { ExplainerType } from '@/api/data/inference';
import { useGetFidelityEvaluationsAllTypes } from '@/api/evaluation';
import { useGetExplanation } from '@/api/inference';
import { getGreenRedRGB } from '@/lib/getGreenRedRGB';
import { round } from '@/lib/round';

import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface Props {
  queryId: number;
  modelId: number | undefined;
  explainerType: ExplainerType;
}

export function SingleExplainerEvaluationCard({
  queryId,
  modelId,
  explainerType,
}: Props) {
  const explanations = useGetExplanation({
    queryId: queryId,
    modelId,
    explainerType: explainerType,
  });

  const fidelityEvaluations = useGetFidelityEvaluationsAllTypes({
    queryId: queryId,
    explanation: explanations.data,
  });

  return (
    <Card className="border-none">
      <CardContent>
        {fidelityEvaluations.isSuccess ? (
          <Table>
            <TableBody>
              {fidelityTypes.map((fidelityType, i) => (
                <TableRow className="hover:bg-transparent" key={fidelityType}>
                  <TableCell className="font-medium">
                    {fidelityTypeToDisplay[fidelityType]}
                  </TableCell>
                  <TableCell
                    className="font-medium"
                    style={{
                      color: getGreenRedRGB(
                        1 - fidelityEvaluations.data[i].score,
                      ),
                    }}
                  >
                    {round(fidelityEvaluations.data[i].score)}
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
