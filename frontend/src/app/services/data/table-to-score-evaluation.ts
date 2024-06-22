export interface TableToScore {
  tableCount: number;
  score: number;
}

interface TableToScoreEvaluation {
  scores: TableToScore[];
}

export default TableToScoreEvaluation;
