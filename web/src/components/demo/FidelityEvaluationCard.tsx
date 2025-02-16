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
}

export function FidelityEvaluationCard({
  fidelityType,
  explainerTypes,
  queryId,
}: Props) {
  const explanations = useGetExplanations({
    queryId: queryId,
    explainerTypes: explainerTypes,
  });
  const evaluations = useGetFidelityEvaluations({
    queryId: queryId,
    explanations: explanations.data,
    type: fidelityType,
  });

  return (
    <Card className="border-none">
      <CardHeader className="p-0 px-6 pb-2 pt-4">
        <CardTitle>{fidelityTypeToDisplay[fidelityType]}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {evaluations.isSuccess &&
        explainerTypes.length == evaluations.data.length ? (
          <Table>
            <TableBody>
              {explainerTypes.map((explainerType, i) => (
                <TableRow className="hover:bg-background" key={explainerType}>
                  <TableCell className="font-medium">
                    {explainerTypeToDisplay[explainerType]}
                  </TableCell>
                  <TableCell className="font-medium">
                    {round(evaluations.data[i].score)}
                  </TableCell>
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
