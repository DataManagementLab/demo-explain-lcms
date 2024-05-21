import GraphNode from './graph-node';
import Plan from './plan';

interface FullPlan extends Plan {
  dotGraph: string;
  graphNodes: GraphNode[];
}

export default FullPlan;
