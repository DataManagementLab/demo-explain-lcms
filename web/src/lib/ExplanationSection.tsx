export const explanationSections = [
  'Node Ranking',
  'Runtime Correlation',
  'Explainer Evaluation',
] as const;
export type ExplanationSection = (typeof explanationSections)[number];
