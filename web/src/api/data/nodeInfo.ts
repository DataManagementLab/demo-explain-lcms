enum NodeType {
  column = 'column',
  filterColumn = 'filter_column',
  outputColumn = 'output_column',
  table = 'table',
  plan = 'plan',
  logicalPred = 'logical_pred_',
}

type NodeInfo = {
  nodeType: NodeType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & Record<string, any>;

export interface GraphNode {
  nodeId: number;
  label: string;
  nodeInfo: NodeInfo;
}
