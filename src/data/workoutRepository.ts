import type {
  ResistanceEvent,
  ResistanceExerciseEntry,
  ResistanceSet,
  ResistanceWorkoutDraft,
} from "../domain/fitness.ts";
import { EXERCISE_NOTE_MAX_LENGTH } from "../domain/fitness.ts";
import { requiresWeight } from "../domain/equipment.ts";
import { getDatabase } from "./database.ts";

const pendingDraftSaves = new Map<string, Promise<ResistanceWorkoutDraft>>();

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function draftSet(
  set?: Pick<ResistanceSet, "weightKg" | "repetitions">,
): ResistanceSet {
  return {
    id: crypto.randomUUID(),
    weightKg: set?.weightKg ?? null,
    repetitions: set?.repetitions ?? 0,
    completed: false,
  };
}

function copyExercises(exercises: ResistanceExerciseEntry[]) {
  return exercises.map(({ notes: _notes, ...exercise }) => ({
    ...exercise,
    id: crypto.randomUUID(),
    sets: exercise.sets.map((set) => draftSet(set)),
  }));
}

function cleanExerciseNotes(exercises: ResistanceExerciseEntry[]) {
  return exercises.map((exercise) => {
    const notes = exercise.notes?.trim();
    return { ...exercise, notes: notes || undefined };
  });
}

function assertExerciseNotesValid(exercises: ResistanceExerciseEntry[]) {
  if (
    exercises.some((exercise) =>
      (exercise.notes?.length ?? 0) > EXERCISE_NOTE_MAX_LENGTH
    )
  ) {
    throw new Error(
      `Exercise notes must be ${EXERCISE_NOTE_MAX_LENGTH} characters or fewer`,
    );
  }
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

export async function createDraftFromTemplate(
  date: string,
  templateId: string,
) {
  const database = await getDatabase();
  const template = await database.get("workoutTemplates", templateId);
  if (!template) throw new Error("Workout template not found");
  const timestamp = new Date().toISOString();
  const draft: ResistanceWorkoutDraft = {
    id: `draft:${crypto.randomUUID()}`,
    date,
    name: template.name,
    exercises: template.exercises.map((exercise) => ({
      id: crypto.randomUUID(),
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      equipment: exercise.equipment,
      sets: Array.from({ length: exercise.setCount }, () => draftSet()),
    })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await database.put("workoutDrafts", draft);
  return draft;
}

export async function createEditDraft(eventId: string) {
  const database = await getDatabase();
  const existingDraft = await database.getFromIndex(
    "workoutDrafts",
    "by-source-event",
    eventId,
  );
  if (existingDraft) return existingDraft;
  const event = await database.get("fitnessEvents", eventId);
  if (!event || event.type !== "resistance") {
    throw new Error("Resistance workout not found");
  }
  const timestamp = new Date().toISOString();
  const draft: ResistanceWorkoutDraft = {
    id: `draft:${crypto.randomUUID()}`,
    date: event.date,
    name: event.name,
    exercises: structuredClone(event.exercises),
    sourceEventId: event.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await database.put("workoutDrafts", draft);
  return draft;
}

export async function duplicateResistanceEvent(
  eventId: string,
  date: string,
  name: string,
) {
  const database = await getDatabase();
  const event = await database.get("fitnessEvents", eventId);
  if (!event || event.type !== "resistance") {
    throw new Error("Resistance workout not found");
  }
  const timestamp = new Date().toISOString();
  const draft: ResistanceWorkoutDraft = {
    id: `draft:${crypto.randomUUID()}`,
    date,
    name: cleanName(name),
    exercises: copyExercises(event.exercises),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await database.put("workoutDrafts", draft);
  return draft;
}

export async function saveWorkoutDraft(draft: ResistanceWorkoutDraft) {
  assertExerciseNotesValid(draft.exercises);
  const saved = {
    ...draft,
    name: cleanName(draft.name),
    updatedAt: new Date().toISOString(),
  };
  const previousSave: Promise<unknown> = pendingDraftSaves.get(draft.id) ??
    Promise.resolve();
  const save = previousSave.catch(() => undefined).then(async () => {
    const database = await getDatabase();
    await database.put("workoutDrafts", saved);
    return saved;
  });
  pendingDraftSaves.set(draft.id, save);
  try {
    return await save;
  } finally {
    if (pendingDraftSaves.get(draft.id) === save) {
      pendingDraftSaves.delete(draft.id);
    }
  }
}

export async function deleteWorkoutDraft(id: string) {
  await pendingDraftSaves.get(id);
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
      (!requiresWeight(exercise.equipment) || (set.weightKg ?? 0) > 0)
    )
  );
  if (draft.exercises.length === 0 || sets.length === 0 || !validSets) {
    throw new Error("Complete every set before finishing the workout");
  }
}

export async function completeWorkoutDraft(id: string) {
  await pendingDraftSaves.get(id);
  const database = await getDatabase();
  const transaction = database.transaction(
    ["workoutDrafts", "fitnessEvents"],
    "readwrite",
  );
  const draft = await transaction.objectStore("workoutDrafts").get(id);
  if (!draft) throw new Error("Workout draft not found");
  assertWorkoutComplete(draft);

  const timestamp = new Date().toISOString();
  const source = draft.sourceEventId
    ? await transaction.objectStore("fitnessEvents").get(draft.sourceEventId)
    : undefined;
  if (draft.sourceEventId && (!source || source.type !== "resistance")) {
    throw new Error("Original resistance workout not found");
  }
  const event: ResistanceEvent = {
    id: source?.id ?? `event:${crypto.randomUUID()}`,
    date: draft.date,
    type: "resistance",
    name: cleanName(draft.name),
    exercises: cleanExerciseNotes(draft.exercises),
    createdAt: source?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  await transaction.objectStore("fitnessEvents").put(event);
  await transaction.objectStore("workoutDrafts").delete(id);
  await transaction.done;
  return { draftId: id, event };
}
