import { format } from "date-fns";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { ExercisePickerDialog } from "./components/ExercisePickerDialog.tsx";
import { WorkoutExerciseList } from "./components/WorkoutExerciseList.tsx";
import { WorkoutHeader } from "./components/WorkoutHeader.tsx";
import { isWorkoutReady } from "./resistanceProgress.ts";
import { useWorkoutDraft } from "./useWorkoutDraft.ts";

export function WorkoutPage() {
  const { draftId = "" } = useParams();
  const navigate = useNavigate();
  const workout = useWorkoutDraft(draftId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);

  if (!workout.draft) {
    if (
      workout.status === "idle" || workout.status === "loading" || completing
    ) {
      return (
        <section className="page">
          <p className="loading-state">Loading workout…</p>
        </section>
      );
    }
    return (
      <Navigate to={`/calendar/${format(new Date(), "yyyy-MM")}`} replace />
    );
  }
  const draft = workout.draft;
  const finish = async () => {
    try {
      setCompleting(true);
      await workout.finish();
      navigate(`/day/${draft.date}`);
    } catch (caught) {
      setCompleting(false);
      setError(
        caught instanceof Error ? caught.message : "Could not finish workout",
      );
    }
  };
  const discard = async () => {
    if (!globalThis.confirm("Discard this workout draft?")) return;
    await workout.discard();
    navigate(`/day/${draft.date}`);
  };

  return (
    <section className="page workout-page">
      <WorkoutHeader
        date={draft.date}
        exerciseCount={draft.exercises.length}
        name={draft.name}
        onDiscard={discard}
        onFinish={finish}
        ready={isWorkoutReady(draft) && !completing}
      />
      {error && <p className="form-error workout-error">{error}</p>}
      {draft.exercises.length === 0
        ? (
          <EmptyState
            action={
              <button
                className="primary-button"
                onClick={() => setPickerOpen(true)}
                type="button"
              >
                ＋ Add first exercise
              </button>
            }
            description="Choose from your dumbbell and bodyweight exercise library."
            icon="🏋️"
            title="Build your workout"
          />
        )
        : (
          <WorkoutExerciseList
            draft={draft}
            events={workout.events}
            onAdd={() => setPickerOpen(true)}
            onChangeSets={workout.changeSets}
            onRemove={workout.removeExercise}
          />
        )}
      {pickerOpen && (
        <ExercisePickerDialog
          exercises={workout.exercises}
          existingIds={draft.exercises.map((entry) => entry.exerciseId)}
          onClose={() => setPickerOpen(false)}
          onSelect={(exercise) => {
            workout.addExercise(exercise);
            setPickerOpen(false);
          }}
        />
      )}
    </section>
  );
}
