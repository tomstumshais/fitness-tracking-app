import type {
  Equipment,
  FitnessEvent,
  ResistanceExerciseEntry,
  ResistanceSet,
  ResistanceWorkoutDraft,
} from "../../domain/fitness.ts";
import { equipmentSetLabel, requiresWeight } from "../../domain/equipment.ts";

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
  equipment: Equipment,
) {
  if (!set) return "—";
  return `${
    equipmentSetLabel(equipment) ?? set.weightKg ?? 0
  } × ${set.repetitions}`;
}

const TARGET_SETS = 3;
const TARGET_REPETITIONS = 12;

function completedSets(exercise: ResistanceExerciseEntry) {
  return exercise.sets.filter((set) =>
    set.completed && set.repetitions > 0 &&
    (!requiresWeight(exercise.equipment) ||
      (Number.isFinite(set.weightKg) && (set.weightKg ?? 0) > 0))
  );
}

function sameWeight(sets: ResistanceSet[]) {
  const weight = sets[0]?.weightKg;
  return typeof weight === "number" && Number.isFinite(weight) && weight > 0 &&
      sets.every((set) => set.weightKg === weight)
    ? weight
    : undefined;
}

export function getProgressSummary(
  current: ResistanceExerciseEntry,
  previous?: ResistanceExerciseEntry,
) {
  const weighted = requiresWeight(current.equipment);
  const targetSets = Math.max(TARGET_SETS, current.sets.length);
  const completed = completedSets(current);
  const reachedTarget =
    completed.filter((set) => set.repetitions >= TARGET_REPETITIONS).length;
  const weight = sameWeight(current.sets);
  const targetDetail = `${reachedTarget}/${targetSets} sets reached 12`;

  if (
    current.sets.length >= TARGET_SETS &&
    reachedTarget === current.sets.length &&
    (!weighted || weight !== undefined)
  ) {
    return {
      label: weighted ? "Ready to increase weight" : "Rep target reached",
      detail: targetDetail,
      tone: "positive",
    };
  }

  if (
    weighted && completed.length > 0 &&
    previous?.equipment === current.equipment
  ) {
    const previousWeight = sameWeight(completedSets(previous));
    if (
      weight !== undefined && previousWeight !== undefined &&
      weight > previousWeight
    ) {
      return {
        label: "Weight increased",
        detail: `${previousWeight} → ${weight} kg`,
        tone: "neutral",
      };
    }
  }

  const mixedWeights = weighted && new Set(
        current.sets.map((set) => set.weightKg).filter((value) =>
          value !== null
        ),
      ).size > 1;
  return {
    label: `Building toward ${targetSets} × ${TARGET_REPETITIONS}`,
    detail: mixedWeights ? "Use the same weight for all sets" : targetDetail,
    tone: "neutral",
  };
}

export function isWorkoutReady(draft: ResistanceWorkoutDraft) {
  const sets = draft.exercises.flatMap((exercise) => exercise.sets);
  return draft.exercises.length > 0 && sets.length > 0 &&
    draft.exercises.every((exercise) =>
      exercise.sets.length > 0 &&
      exercise.sets.every((set) =>
        set.completed && set.repetitions > 0 &&
        (!requiresWeight(exercise.equipment) || (set.weightKg ?? 0) > 0)
      )
    );
}
