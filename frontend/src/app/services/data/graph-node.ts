import NodeType from './node-type';

interface GraphNode {
  nodeId: number;
  nodeInfo: {
    nodeType: NodeType;
  };
}

export default GraphNode;
