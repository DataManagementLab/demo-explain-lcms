import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/evaluation-results')({
  component: () => <div>Hello /evaluation-results!</div>,
});
