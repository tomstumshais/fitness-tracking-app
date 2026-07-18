import type {
  ResistanceEvent,
  ResistanceWorkoutDraft,
} from "../domain/fitness.ts";
import { getDatabase } from "./database.ts";

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function listWorkoutDrafts() {
  const database = await getDatabase();
  const drafts = await database.getAll("workoutDrafts");
  return drafts.sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
}

export async function createWorkoutDraft(date: string, name: string) {
  const timestamp = new Date().toISOString();
  const draft: ResistanceWorkoutDraft = {
    id: `draft:${crypto.randomUUID()}`,
    date,
    name: cleanName(name),
    exercises: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const database = await getDatabase();
  await database.put("workoutDrafts", draft);
  return draft;
}

export async function saveWorkoutDraft(draft: ResistanceWorkoutDraft) {
  const saved = { ...draft, name: cleanName(draft.name) };
  const database = await getDatabase();
  await database.put("workoutDrafts", saved);
  return saved;
}

export async function deleteWorkoutDraft(id: string) {
  const database = await getDatabase();
  const draft = await database.get("workoutDrafts", id);
  if (!draft) throw new Error("Workout draft not found");
  await database.delete("workoutDrafts", id);
  return id;
}

function assertWorkoutComplete(draft: ResistanceWorkoutDraft) {
  const sets = draft.exercises.flatMap((exercise) => exercise.sets);
  const validSets = draft.exercises.every((exercise) =>
    exercise.sets.length > 0 &&
    exercise.sets.every((set) =>
      set.completed && set.repetitions > 0 &&
      (exercise.equipment === "bodyweight" || (set.weightKg ?? 0) > 0)
    )
  );
  if (draft.exercises.length === 0 || sets.length === 0 || !validSets) {
    throw new Error("Complete every set before finishing the workout");
  }
}

export async function completeWorkoutDraft(id: string) {
  const database = await getDatabase();
  const transaction = database.transaction(
    ["workoutDrafts", "fitnessEvents"],
    "readwrite",
  );
  const draft = await transaction.objectStore("workoutDrafts").get(id);
  if (!draft) throw new Error("Workout draft not found");
  assertWorkoutComplete(draft);

  const timestamp = new Date().toISOString();
  const event: ResistanceEvent = {
    id: `event:${crypto.randomUUID()}`,
    date: draft.date,
    type: "resistance",
    name: cleanName(draft.name),
    exercises: draft.exercises,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await transaction.objectStore("fitnessEvents").put(event);
  await transaction.objectStore("workoutDrafts").delete(id);
  await transaction.done;
  return { draftId: id, event };
}
