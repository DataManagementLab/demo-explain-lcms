import { ExplainerType, explainerTypeToDisplay } from '@/api/data/inference';
import { useGetFidelityEvaluations } from '@/api/evaluation';
import { useGetExplanations } from '@/api/inference';
import { round } from '@/lib/round';
import { useDemoStore } from '@/stores/demoStore';
import { useShallow } from 'zustand/react/shallow';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface Props {
  fidelityType: 'plus' | 'minus';
  explainerTypes: ExplainerType[];
}

export function FidelityEvaluationCard({
  fidelityType,
  explainerTypes,
}: Props) {
  const queryId = useDemoStore(useShallow((state) => state.queryId));
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
      <CardHeader className="p-0 px-6 pb-2 pt-6">
        <CardTitle>
          Fidelity {fidelityType == 'plus' ? 'Plus' : 'Minus'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {evaluations.isSuccess ? (
          <Table>
            <TableBody>
              {explainerTypes.map((explainerType, i) => (
                <TableRow className="hover:bg-background" key={explainerType}>
                  <TableCell className="font-medium">
                    {explainerTypeToDisplay.get(explainerType)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {`${round(evaluations.data[i].relativeChange * 100)}%`}
                  </TableCell>
                  <TableCell className="font-medium">
                    {evaluations.data[i].score}
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
