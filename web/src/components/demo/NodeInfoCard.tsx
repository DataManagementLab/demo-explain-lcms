import { GraphNode } from '@/api/data/nodeInfo';
import { useGetFeatures } from '@/api/general';
import { useGetQuery } from '@/api/queries';
import { round } from '@/lib/round';
import { useDemoStore } from '@/stores/demoStore';
import { useShallow } from 'zustand/react/shallow';

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
      if (typeof value.value == 'number') {
        return { key: value.key, value: round(value.value) };
      } else if (typeof value.value == 'string' && value.value.length < 40) {
        return value;
      } else {
        return undefined;
      }
    })
    .filter((value) => value != undefined);
}

export default function NodeInfoCard() {
  const [queryId, selectedNodeId] = useDemoStore(
    useShallow((state) => [state.queryId, state.selectedNodeId]),
  );
  const query = useGetQuery({ queryId: queryId });
  const features = useGetFeatures();
  const selectedNode = query.isSuccess
    ? query.data.graphNodes.find((node) => node.nodeId == selectedNodeId)
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
      <Card>
        <CardHeader>
          <CardTitle>{selectedNode.label}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2">
          {nodeFeatures && nodeOtherAttributes && (
            <>
              <div className="flex flex-col gap-3">
                <Label>Features</Label>
                <ScrollArea className="h-[120px] rounded-md border">
                  <Table>
                    <TableBody>
                      {nodeFeatures.map((value) => (
                        <TableRow key={value.key}>
                          <TableCell className="font-medium">
                            {value.key}
                          </TableCell>
                          <TableCell>{value.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              <div className="flex flex-col gap-3">
                <Label>Other attributes</Label>
                <ScrollArea className="h-[120px] rounded-md border">
                  <Table>
                    <TableBody>
                      {nodeOtherAttributes.map((value) => (
                        <TableRow key={value.key}>
                          <TableCell className="font-medium">
                            {value.key}
                          </TableCell>
                          <TableCell>{value.value}</TableCell>
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
