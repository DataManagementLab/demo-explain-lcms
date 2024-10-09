import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demo')({
  component: () => <div>Hello /demo!</div>,
});
