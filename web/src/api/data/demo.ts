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

export interface QueryStats {
  tables: number;
  columns: number;
  plans: number;
  joins: number;
  predicates: number;
  orderBy: boolean;
}

export interface Plan {
  id: number;
  planRuntime: number;
  queryStats: QueryStats;
  sql: string;
}

export interface FullPlan extends Plan {
  dotGraph: string;
  graphNodes: GraphNode[];
}
