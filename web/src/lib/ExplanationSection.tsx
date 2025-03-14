export const explanationSections = [
  'Node Ranking',
  'Runtime Correlation',
  'Explanation Quality',
] as const;
export type ExplanationSection = (typeof explanationSections)[number];
