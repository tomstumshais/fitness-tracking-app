import type { CustomExerciseInput, Exercise } from "../domain/fitness.ts";
import { getDatabase } from "./database.ts";

export class ExerciseNameExistsError extends Error {
  constructor() {
    super("An exercise with this name already exists");
  }
}

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

async function assertUniqueName(name: string, ignoredId?: string) {
  const normalizedName = cleanName(name).toLocaleLowerCase();
  const exercises = await listExercises();
  if (
    exercises.some((item) =>
      item.id !== ignoredId && item.name.toLocaleLowerCase() === normalizedName
    )
  ) {
    throw new ExerciseNameExistsError();
  }
}

export async function listExercises() {
  const database = await getDatabase();
  const exercises = await database.getAll("exercises");
  return exercises.sort((left, right) => left.name.localeCompare(right.name));
}

export async function createCustomExercise(input: CustomExerciseInput) {
  const name = cleanName(input.name);
  await assertUniqueName(name);
  const timestamp = new Date().toISOString();
  const exercise: Exercise = {
    ...input,
    id: `custom:${crypto.randomUUID()}`,
    name,
    source: "custom",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const database = await getDatabase();
  await database.put("exercises", exercise);
  return exercise;
}

export async function updateCustomExercise(
  id: string,
  input: CustomExerciseInput,
) {
  const database = await getDatabase();
  const existing = await database.get("exercises", id);
  if (!existing || existing.source !== "custom") {
    throw new Error("Custom exercise not found");
  }

  const name = cleanName(input.name);
  await assertUniqueName(name, id);
  const exercise: Exercise = {
    ...existing,
    ...input,
    name,
    updatedAt: new Date().toISOString(),
  };
  await database.put("exercises", exercise);
  return exercise;
}

export async function deleteCustomExercise(id: string) {
  const database = await getDatabase();
  const exercise = await database.get("exercises", id);
  if (!exercise || exercise.source !== "custom") {
    throw new Error("Custom exercise not found");
  }
  await database.delete("exercises", id);
  return id;
}
