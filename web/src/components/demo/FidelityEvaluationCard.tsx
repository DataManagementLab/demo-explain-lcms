import { FidelityType, fidelityTypeToDisplay } from '@/api/data/evaluation';
import { ExplainerType, explainerTypeToDisplay } from '@/api/data/inference';
import { useGetFidelityEvaluations } from '@/api/evaluation';
import { useGetExplanations } from '@/api/inference';
import { round } from '@/lib/round';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface Props {
  fidelityType: FidelityType;
  explainerTypes: ExplainerType[];
  queryId: number;
  modelId: number | undefined;
}

export function FidelityEvaluationCard({
  fidelityType,
  explainerTypes,
  queryId,
  modelId,
}: Props) {
  const explanations = useGetExplanations({
    queryId: queryId,
    explainerTypes: explainerTypes,
    modelId,
  });
  const evaluations = useGetFidelityEvaluations({
    queryId: queryId,
    explanations: explanations.data,
    type: fidelityType,
  });

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>{fidelityTypeToDisplay[fidelityType]}</CardTitle>
      </CardHeader>
      <CardContent>
        {evaluations.isSuccess &&
        explainerTypes.length == evaluations.data.length ? (
          <Table>
            <TableBody>
              {explainerTypes.map((explainerType, i) => (
                <TableRow className="hover:bg-transparent" key={explainerType}>
                  <TableCell className="font-medium">
                    {explainerTypeToDisplay[explainerType]}
                  </TableCell>
                  <TableCell>{round(evaluations.data[i].score)}</TableCell>
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
