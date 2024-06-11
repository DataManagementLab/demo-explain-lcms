import NodeType from './node-type';

type NodeInfoType = {
  nodeType: NodeType;
} & Record<string, any>;

export default NodeInfoType;
