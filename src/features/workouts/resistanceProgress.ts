import type {
  FitnessEvent,
  ResistanceExerciseEntry,
  ResistanceSet,
  ResistanceWorkoutDraft,
} from "../../domain/fitness.ts";

export function findPreviousExercise(
  events: FitnessEvent[],
  draft: ResistanceWorkoutDraft,
  exerciseId: string,
) {
  return events
    .filter((event) =>
      event.type === "resistance" &&
      event.id !== draft.sourceEventId &&
      (event.date < draft.date ||
        (event.date === draft.date && event.createdAt < draft.createdAt))
    )
    .sort((left, right) =>
      right.date.localeCompare(left.date) ||
      right.createdAt.localeCompare(left.createdAt)
    )
    .flatMap((event) => event.type === "resistance" ? event.exercises : [])
    .find((exercise) => exercise.exerciseId === exerciseId);
}

export function formatPreviousSet(
  set: ResistanceSet | undefined,
  bodyweight: boolean,
) {
  if (!set) return "—";
  return `${bodyweight ? "BW" : set.weightKg ?? 0} × ${set.repetitions}`;
}

function trainingLoad(exercise: ResistanceExerciseEntry) {
  const sets = exercise.sets.filter((set) => set.completed);
  return exercise.equipment === "bodyweight"
    ? sets.reduce((total, set) => total + set.repetitions, 0)
    : sets.reduce(
      (total, set) => total + (set.weightKg ?? 0) * set.repetitions,
      0,
    );
}

export function getProgressSummary(
  current: ResistanceExerciseEntry,
  previous?: ResistanceExerciseEntry,
) {
  if (!previous) return { label: "First session", tone: "neutral" };
  const currentLoad = trainingLoad(current);
  if (currentLoad === 0) {
    return { label: "Complete sets to compare", tone: "neutral" };
  }
  const previousLoad = trainingLoad(previous);
  if (previousLoad === 0) return { label: "First comparison", tone: "neutral" };
  const difference = Math.round(
    (currentLoad - previousLoad) / previousLoad * 100,
  );
  const unit = current.equipment === "bodyweight" ? "reps" : "volume";
  if (difference > 0) {
    return { label: `+${difference}% ${unit}`, tone: "positive" };
  }
  if (difference < 0) {
    return { label: `${Math.abs(difference)}% below`, tone: "lower" };
  }
  return { label: "Matched previous", tone: "matched" };
}

export function isWorkoutReady(draft: ResistanceWorkoutDraft) {
  const sets = draft.exercises.flatMap((exercise) => exercise.sets);
  return draft.exercises.length > 0 && sets.length > 0 &&
    draft.exercises.every((exercise) =>
      exercise.sets.length > 0 &&
      exercise.sets.every((set) =>
        set.completed && set.repetitions > 0 &&
        (exercise.equipment === "bodyweight" || (set.weightKg ?? 0) > 0)
      )
    );
}
