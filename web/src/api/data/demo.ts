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
  idInRun: number;
  planRuntime: number;
  queryStats: QueryStats;
  sql: string;
}

export interface QueriesPage {
  queries: Plan[];
  limit: number;
  offset: number;
  totalCount: number;
}

export interface FullPlan extends Plan {
  dotGraph: string;
  graphNodes: GraphNode[];
}
