import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor')({
  component: () => <div>Hello /editor!</div>,
});
