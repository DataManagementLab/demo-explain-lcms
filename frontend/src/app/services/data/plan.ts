import GraphNodesStats from './graph-nodes-stats';

interface Plan {
  id: number;
  graphNodesStats: GraphNodesStats;
  sql: string;
}

export default Plan;
