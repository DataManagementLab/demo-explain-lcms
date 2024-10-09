import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="mt-60 flex justify-center">
      <h3>
        Welcome to Explainability Demo of Zero-Shot Cost Models for Databases
      </h3>
    </div>
  );
}
