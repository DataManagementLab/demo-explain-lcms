import Explanation from '../services/data/explanation';
import GraphNode from '../services/data/graph-node';
import Prediction from '../services/data/prediction';

export function getNodeImportance(node: GraphNode, prediction: Prediction, explanation: Explanation) {
  return {
    node: node,
    importance: explanation.nodeImportance[node.nodeId],
    value: prediction.prediction * explanation.nodeImportance[node.nodeId],
  };
}
