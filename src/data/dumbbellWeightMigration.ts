import type {
  ResistanceEvent,
  ResistanceWorkoutDraft,
} from "../domain/fitness.ts";

type ResistanceRecord = ResistanceEvent | ResistanceWorkoutDraft;

export function addDumbbellGripWeight<T extends ResistanceRecord>(
  record: T,
  updatedAt = new Date().toISOString(),
): T {
  let changed = false;
  const exercises = record.exercises.map((exercise) => {
    if (exercise.equipment !== "dumbbell") return exercise;
    const sets = exercise.sets.map((set) => {
      if (set.weightKg === null) return set;
      changed = true;
      return { ...set, weightKg: set.weightKg + 1 };
    });
    return { ...exercise, sets };
  });

  return changed ? { ...record, exercises, updatedAt } : record;
}
