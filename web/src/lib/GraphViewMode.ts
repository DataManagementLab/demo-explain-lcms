export const graphViewModes = [
  'nodeTypes',
  'actualRuntimes',
  'nodeImportance',
] as const;

export type GraphViewMode = (typeof graphViewModes)[number];

export function isGraphViewMode(value: string): value is GraphViewMode {
  return graphViewModes.includes(value as GraphViewMode);
}
