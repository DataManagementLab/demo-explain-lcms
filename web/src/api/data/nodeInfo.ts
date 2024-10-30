enum NodeType {
  column = 'column',
  filterColumn = 'filter_column',
  outputColumn = 'output_column',
  table = 'table',
  plan = 'plan',
  logicalPred = 'logical_pred_',
}

export const nodeTypeToDisplay = new Map([
  [NodeType.column, 'Column'],
  [NodeType.filterColumn, 'Filter'],
  [NodeType.outputColumn, 'Output'],
  [NodeType.table, 'Table'],
  [NodeType.plan, 'Plan'],
  [NodeType.logicalPred, 'Predicate'],
]);

type NodeInfo = {
  nodeType: NodeType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & Record<string, any>;

export interface GraphNode {
  nodeId: number;
  label: string;
  nodeInfo: NodeInfo;
}

export const nodeFieldSkipToken = '___';

export const nodeFieldToDisplay = new Map<string, string>([
  ['nodeType', 'Node type'],

  ['tablename', 'Table name'],
  ['attname', 'Attribute name'],
  ['nullFrac', 'Fraction of nulls'],
  ['avgWidth', 'Average width'],
  ['nDistinct', 'Distinct values'],
  ['correlation', 'Correlation'],
  ['dataType', 'Data type'],
  ['tableSize', 'Table size'],

  ['relname', 'Table name'],
  ['reltuples', 'Tuples'],
  ['relpages', 'Pages'],

  ['aggregation', 'Aggregation'],

  ['operator', 'Operator'],

  ['column', nodeFieldSkipToken],
  ['columnName', 'Column'],
  ['literal', 'Literal'],
  ['literalFeature', 'Literal Feature'],

  ['opName', 'Operator name'],
  ['estStartupCost', 'Est. startup cost'],
  ['estCost', 'Est. cost'],
  ['estCard', 'Est. cardinality'],
  ['estWidth', 'Est. width'],
  ['actStartupCost', 'Act. start time (ms)'],
  ['actTime', 'Act. end time (ms)'],
  ['actCard', 'Act. cardinality'],
  ['actChildrenCard', 'Act. children cardinality'],
  ['estChildrenCard', 'Est. children cardinality'],
  ['workersPlanned', 'Planned workers'],
  ['innerUnique', nodeFieldSkipToken],
  ['estPg', nodeFieldSkipToken],
  ['estDeepdb', nodeFieldSkipToken],
  ['ddEstCard', nodeFieldSkipToken],
  ['ddEstChildrenCard', nodeFieldSkipToken],
  ['planRuntime', nodeFieldSkipToken],
  ['sql', nodeFieldSkipToken],
  ['actualRuntime', 'Approx. act. runtime (ms)'],
  ['actualRuntimeSeconds', nodeFieldSkipToken],
  ['actualImportance', 'Approx. act. importance'],
]);
