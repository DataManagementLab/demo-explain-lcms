export interface NodeStat {
  nodeName: string;
  fraction: number;
}
interface MostImportantNodeEvaluation {
  actualNodes: NodeStat[];
  explainedNodes: NodeStat[];
}

export default MostImportantNodeEvaluation;
