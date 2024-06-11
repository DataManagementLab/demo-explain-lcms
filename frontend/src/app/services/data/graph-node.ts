import NodeInfoType from './node-info-type';

interface GraphNode {
  nodeId: number;
  label: string;
  nodeInfo: NodeInfoType;
}

export default GraphNode;
