import { ExplainerType, explainerTypeToDisplay } from '@/api/data/inference';
import { useGetCorrelaitonEvaluations } from '@/api/evaluation';
import { useGetExplanations } from '@/api/inference';
import { round } from '@/lib/round';
import { useDemoStore } from '@/stores/demoStore';
import { useShallow } from 'zustand/react/shallow';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface Props {
  correlationType: 'pearson' | 'spearman';
  explainerTypes: ExplainerType[];
}

export function CorrelationScoreCard({
  correlationType,
  explainerTypes,
}: Props) {
  const [queryId] = useDemoStore(useShallow((state) => [state.queryId]));
  const explanations = useGetExplanations({
    queryId: queryId,
    explainerTypes: explainerTypes,
  });

  const evaluations = useGetCorrelaitonEvaluations({
    queryId: queryId,
    explanations: explanations.data,
    type: correlationType,
  });

  return (
    <Card className="border-none">
      <CardHeader className="p-0 px-6 pb-2 pt-6">
        <CardTitle>
          {correlationType == 'pearson' ? 'Pearson' : 'Spearman'} Correlation
          Score With Base Explainer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {evaluations.isSuccess ? (
          <Table>
            <TableBody>
              {evaluations.data.map((correlation, i) => (
                <TableRow className="hover:bg-background" key={i}>
                  <TableCell>
                    {explainerTypeToDisplay.get(explainerTypes[i])}
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
