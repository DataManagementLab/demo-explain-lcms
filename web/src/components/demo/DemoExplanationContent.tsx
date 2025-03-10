import { JSX } from 'react';
import { CorrelationType } from '@/api/data/evaluation';
import { ExplainerType } from '@/api/data/inference';
import {
  ExplanationSection,
  explanationSections,
} from '@/lib/ExplanationSection';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CorrelationBarsCard } from './CorrelationBarsCard';
import { ExplainerSelect } from './ExplainerSelect';
import { ExplanationCard } from './ExplanationCard';
import { SingleExplainerEvaluationCard } from './SingleExplainerEvaluationCard';

interface BaseExplainerInfo {
  explainerType: ExplainerType;
  pearsonFn: CorrelationType;
  spearmanFn: CorrelationType;
}

const baseExplainerInfos = [
  {
    explainerType: 'BaseExplainer',
    pearsonFn: 'pearson',
    spearmanFn: 'spearman',
  },
  {
    explainerType: 'BaseExplainerCardinality',
    pearsonFn: 'pearson-cardinality',
    spearmanFn: 'spearman-cardinality',
  },
  {
    explainerType: 'BaseExplainerNodeDepth',
    pearsonFn: 'pearson-node-depth',
    spearmanFn: 'spearman-node-depth',
  },
] satisfies BaseExplainerInfo[];

function insertSeparators(elements: JSX.Element[]) {
  return elements.flatMap((value, index) =>
    index == elements.length - 1 ? value : [value, <Separator key={index} />],
  );
}

interface Props {
  explainer: ExplainerType;
  setExplainer: (explainer: ExplainerType) => void;
  explanationSection: ExplanationSection;
  setExplanationSection: (value: ExplanationSection) => void;
  queryId: number;
  nodeId: number | undefined;
  setNodeId: (value: number) => void;
}

export function DemoExplanationContent({
  explainer,
  setExplainer,
  explanationSection,
  setExplanationSection,
  queryId,
  nodeId,
  setNodeId,
}: Props) {
  return (
    <Card className="flex grow flex-col overflow-hidden">
      <CardHeader className="flex flex-col gap-3">
        <CardTitle>Explanations</CardTitle>
        <ExplainerSelect explainer={explainer} setExplainer={setExplainer} />
      </CardHeader>
      <CardContent className="flex grow flex-col overflow-hidden px-0 py-0">
        {
          <ScrollArea>
            <Tabs
              defaultValue="Node Ranking"
              value={explanationSection}
              onValueChange={(value) =>
                setExplanationSection(value as ExplanationSection)
              }
            >
              <TabsList className="mx-4 grid h-16 grid-cols-3 gap-x-2 px-2">
                {explanationSections.map((section) => (
                  <TabsTrigger
                    key={section}
                    className="text-wrap whitespace-normal"
                    value={section}
                    disabled={
                      (explainer == 'BaseExplainer' ||
                        explainer == 'BaseExplainerCardinality' ||
                        explainer == 'BaseExplainerNodeDepth') &&
                      (section == 'Runtime Correlation' ||
                        section == 'Explainer Evaluation')
                    }
                  >
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="Node Ranking">
                <ExplanationCard
                  key={`explanation-${explainer}`}
                  explainerType={explainer}
                  queryId={queryId}
                  nodeId={nodeId}
                  setNodeId={setNodeId}
                />
              </TabsContent>
              <TabsContent value="Runtime Correlation">
                {insertSeparators(
                  baseExplainerInfos.map((baseExplainerInfo) => (
                    <CorrelationBarsCard
                      key={`correlation-${baseExplainerInfo.explainerType}`}
                      baseExplainersType={baseExplainerInfo.explainerType}
                      explainerTypes={[
                        baseExplainerInfo.explainerType,
                        explainer,
                      ]}
                      queryId={queryId}
                      nodeId={nodeId}
                      setNodeId={setNodeId}
                    ></CorrelationBarsCard>
                  )),
                )}
              </TabsContent>
              <TabsContent value="Explainer Evaluation">
                <SingleExplainerEvaluationCard
                  queryId={queryId}
                  explainerType={explainer}
                ></SingleExplainerEvaluationCard>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        }
      </CardContent>
    </Card>
  );
}
