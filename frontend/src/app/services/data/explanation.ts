interface Explanation {
  featureImportance: Record<number, Record<string, number>>;
  nodeImportance: Record<number, number>;
}

export default Explanation;
