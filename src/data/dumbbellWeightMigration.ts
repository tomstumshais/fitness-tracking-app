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

export function repairMissedDumbbellWeightAdjustment<
  T extends ResistanceRecord,
>(record: T, updatedAt = new Date().toISOString()): T {
  const hasUnadjustedLateralRaise = record.exercises.some((exercise) =>
    exercise.equipment === "dumbbell" &&
    (exercise.exerciseId === "predefined:dumbbell-lateral-raise" ||
      exercise.exerciseName.trim().toLowerCase() ===
        "dumbbell lateral raise") &&
    exercise.sets.some((set) => set.weightKg === 6)
  );

  return hasUnadjustedLateralRaise
    ? addDumbbellGripWeight(record, updatedAt)
    : record;
}
