import { EmptyState } from "../../components/ui/EmptyState.tsx";

export function ExercisesPage() {
  return (
    <section className="page">
      <p className="eyebrow">Exercise library</p>
      <h1>Dumbbells & bodyweight</h1>
      <p className="page-intro">
        Choose from home-friendly exercises or add your own. Weight is recorded
        in kilograms per dumbbell.
      </p>
      <EmptyState
        description="The predefined library and custom exercise editor are the next feature to be connected."
        icon="⌁"
        title="Exercise library coming next"
      />
    </section>
  );
}
