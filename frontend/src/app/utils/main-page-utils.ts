import Explanation from '../services/data/explanation';
import GraphNode from '../services/data/graph-node';

export function getNodeImportance(
  node: GraphNode,
  fullCost: number,
  explanation: Explanation,
) {
  return {
    node: node,
    importance: explanation.nodeImportance[node.nodeId],
    value: fullCost * explanation.nodeImportance[node.nodeId],
  };
}
