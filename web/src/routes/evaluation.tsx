import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/evaluation')({
  component: () => <div>Hello /evaluation!</div>,
});
