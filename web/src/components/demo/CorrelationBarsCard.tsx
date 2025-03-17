import {useState} from 'react';
import {ExplainerType, explainerTypeToDisplay} from '@/api/data/inference';
import {useGetCorrelaitonEvaluations} from '@/api/evaluation.ts';
import {useGetExplanations} from '@/api/inference';
import {useGetQuery} from '@/api/queries';
import {getBarColor} from '@/lib/barColors.ts';
import {getGreenRedRGB} from '@/lib/getGreenRedRGB.tsx';
import {round} from '@/lib/round.ts';

import {Button} from '../ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {Label} from '../ui/label';
import {Skeleton} from '../ui/skeleton';
import {Table, TableBody, TableCell, TableRow} from '../ui/table';
import {CorrelationBarSingle} from './CorrelationBarSingle';

interface Props {
    baseExplainersType: ExplainerType,
    explainerTypes: ExplainerType[],
    queryId: number,
    nodeId: number | undefined,
    setNodeId: (value: number) => void,
}

export function CorrelationBarsCard({
                                        baseExplainersType,
                                        explainerTypes,
                                        queryId,
                                        nodeId,
                                        setNodeId,
                                    }: Props) {
    const explanations = useGetExplanations({queryId, explainerTypes});
    const query = useGetQuery({queryId});

    const isCardinality = baseExplainersType.includes('Cardinality');
    const correlationTypes = isCardinality
        ? ['pearson-cardinality', 'spearman-cardinality']
        : ['pearson', 'spearman'];

    const pearsonCorr = useGetCorrelaitonEvaluations({
        queryId,
        explanations: [explanations.data.at(1)],
        type: correlationTypes[0] as 'pearson-cardinality' | 'spearman-cardinality' | 'pearson' | 'spearman',

    });
    const spearmanCorr = useGetCorrelaitonEvaluations({
        queryId,
        explanations: [explanations.data.at(1)],
        type: correlationTypes[1] as 'pearson-cardinality' | 'spearman-cardinality' | 'pearson' | 'spearman',
    });

    const validExplanations = explanations.isSuccess
        ? explanations.data.map((explanation) =>
            explanation.scaledImportance.filter((i) => i.score >= 0.01),
        )
        : undefined;

    const [showLegend, setShowLegend] = useState(false);

    return (
        <Card className="h-w-full border-none">
            <CardHeader>
                <CardTitle>{explainerTypeToDisplay[baseExplainersType]}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                            {validExplanations && query.isSuccess  ? (                        <>
                            {validExplanations.map((explanation, i) => (
                                <div
                                    className="flex flex-col gap-1"
                                    key={`bar-${explainerTypes[i]}`}
                                >
                                    <Label>
                                        {i === 0 ? 'Actual Fractions' : 'Node Importance Fractions'}
                                    </Label>
                                    <CorrelationBarSingle
                                        explanation={explanation}
                                        selectedNodeId={nodeId}
                                        setSelectedNodeId={setNodeId}
                                        graphNodes={query.data.graphNodes}
                                    />
                                </div>
                            ))}

                            {showLegend &&(
                                <Table>
                                    <TableBody>
                                        {query.data.graphNodes.map((node) => (
                                            <TableRow
                                                key={node.nodeId}
                                                onClick={() => setNodeId(node.nodeId)}
                                                data-state={node.nodeId == nodeId ? 'selected' : ''}
                                            >
                                                <TableCell>
                                                    {query.data.graphNodes[node.nodeId].label}
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className="h-6 w-6"
                                                        style={{
                                                            backgroundColor: getBarColor(node.nodeId),
                                                        }}
                                                    ></div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                                <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Pearson Correlation
                                        </TableCell>
                                        <TableCell
                                            className="font-bold"
                                            style={{
                                                color: getGreenRedRGB(
                                                    1 - (pearsonCorr.data.at(0)?.score ?? 0),
                                                ),
                                            }}
                                        >
                                            {round(pearsonCorr.data.at(0)?.score ?? 0)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Spearman Correlation
                                        </TableCell>
                                        <TableCell
                                            className="font-bold"
                                            style={{
                                                color: getGreenRedRGB(
                                                    1 - (spearmanCorr.data.at(0)?.score ?? 0),
                                                ),
                                            }}
                                        >
                                            {round(spearmanCorr.data.at(0)?.score ?? 0)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <Button
                                className="items-start"
                                variant="link"
                                size="sm"
                                onClick={() => setShowLegend(!showLegend)}
                            >
                                {showLegend ? 'Hide Legend' : 'Show Legend'}
                            </Button>
                        </>
                    ) : (
                        explainerTypes.map((i) => (
                            <Skeleton className="h-6" key={`skeleton-${i}`}/>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
