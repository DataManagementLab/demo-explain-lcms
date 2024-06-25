import NodeType from './node-type';

type NodeInfo = {
  nodeType: NodeType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & Record<string, any>;

export default NodeInfo;
