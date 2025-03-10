import {
  GraphNode,
  nodeFieldSkipToken,
  nodeFieldToDisplay,
  NodeType,
  nodeTypeToDisplay,
} from '@/api/data/nodeInfo';
import { useGetFeatures } from '@/api/general';
import { useGetQuery } from '@/api/queries';
import { round } from '@/lib/round';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

function filterFeatures(keys: string[], selectedNode: GraphNode) {
  return keys
    .map((key) => ({
      key: key,
      value:
        key in selectedNode.nodeInfo
          ? selectedNode.nodeInfo[key]
          : 'planParameters' in selectedNode.nodeInfo &&
              key in selectedNode.nodeInfo.planParameters
            ? selectedNode.nodeInfo.planParameters[key]
            : undefined,
    }))
    .map((value) => {
      if (nodeFieldToDisplay.get(value.key) == nodeFieldSkipToken) {
        return undefined;
      }

      if (typeof value.value == 'number') {
        return { key: value.key, value: round(value.value) };
      } else if (typeof value.value == 'string') {
        return value;
      } else {
        return undefined;
      }
    })
    .filter((value) => value != undefined);
}

interface Props {
  queryId: number;
  nodeId: number;
}

export function NodeInfoCard({ queryId, nodeId }: Props) {
  const query = useGetQuery({ queryId: queryId });
  const features = useGetFeatures();
  const selectedNode = query.isSuccess
    ? query.data.graphNodes.find((node) => node.nodeId == nodeId)
    : undefined;

  const keys = selectedNode
    ? Object.keys(selectedNode.nodeInfo).concat(
        'planParameters' in selectedNode.nodeInfo
          ? Object.keys(selectedNode.nodeInfo.planParameters)
          : [],
      )
    : undefined;

  const nodeFeatures =
    selectedNode && keys && features.isSuccess
      ? filterFeatures(
          keys.filter((key) => features.data.includes(key)),
          selectedNode,
        )
      : undefined;

  const nodeOtherAttributes =
    selectedNode && keys && features.isSuccess
      ? filterFeatures(
          keys.filter((key) => !features.data.includes(key)),
          selectedNode,
        )
      : undefined;

  return (
    selectedNode && (
      <Card className="flex grow flex-col overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle>
            {`${selectedNode.label} (${nodeTypeToDisplay[selectedNode.nodeInfo.nodeType]})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grow grid-cols-2 grid-rows-1 gap-x-2 overflow-hidden">
          {nodeFeatures && nodeOtherAttributes && (
            <>
              <div className="flex grow flex-col gap-3">
                <Label>Features</Label>
                <ScrollArea className="grow rounded-md border">
                  <Table>
                    <TableBody>
                      {nodeFeatures.map((value) => (
                        <TableRow
                          key={value.key}
                          className="hover:bg-transparent"
                        >
                          <TableCell className="font-medium">
                            {nodeFieldToDisplay.get(value.key)}
                          </TableCell>
                          <TableCell>{value.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              <div className="flex grow flex-col gap-3">
                <Label>Other attributes</Label>
                <ScrollArea className="grow rounded-md border">
                  <Table>
                    <TableBody>
                      {nodeOtherAttributes.map((value) => (
                        <TableRow
                          key={value.key}
                          className="hover:bg-transparent"
                        >
                          <TableCell className="font-medium">
                            {nodeFieldToDisplay.get(value.key)}
                          </TableCell>
                          <TableCell>
                            {value.key == 'nodeType'
                              ? nodeTypeToDisplay[value.value as NodeType]
                              : value.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  );
}
