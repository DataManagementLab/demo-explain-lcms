import { GraphNode } from './nodeInfo';

export interface Dataset {
  id: number;
  name: string;
}

export interface Workload {
  id: number;
  fileName: string;
  queriesCount: number;
}

export interface GraphNodesStats {
  column: number;
  filter_column: number;
  logical_pred_: number;
  output_column: number;
  plan: number;
  table: number;
}

export interface Plan {
  id: number;
  graphNodesStats: GraphNodesStats;
  sql: string;
}

export interface FullPlan extends Plan {
  dotGraph: string;
  graphNodes: GraphNode[];
}
