import type {
  WorkoutTemplate,
  WorkoutTemplateInput,
} from "../domain/fitness.ts";
import { getDatabase } from "./database.ts";

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function cleanInput(input: WorkoutTemplateInput) {
  const name = cleanName(input.name);
  if (name.length < 2 || name.length > 60) {
    throw new Error("Use between 2 and 60 characters for the template name");
  }
  if (input.exercises.length === 0) {
    throw new Error("Add at least one exercise");
  }
  if (
    new Set(input.exercises.map((item) => item.exerciseId)).size !==
      input.exercises.length
  ) {
    throw new Error("Each exercise can only be added once");
  }
  if (
    input.exercises.some((item) =>
      !Number.isInteger(item.setCount) || item.setCount < 1 ||
      item.setCount > 20
    )
  ) {
    throw new Error("Use between 1 and 20 sets per exercise");
  }
  return { name, exercises: structuredClone(input.exercises) };
}

export async function listWorkoutTemplates() {
  const database = await getDatabase();
  const templates = await database.getAll("workoutTemplates");
  return templates.sort((left, right) => left.name.localeCompare(right.name));
}

export async function createTemplateFromEvent(eventId: string, name: string) {
  const database = await getDatabase();
  const event = await database.get("fitnessEvents", eventId);
  if (!event || event.type !== "resistance") {
    throw new Error("Resistance workout not found");
  }
  return createWorkoutTemplate({
    name,
    exercises: event.exercises.map((exercise) => ({
      id: crypto.randomUUID(),
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      equipment: exercise.equipment,
      setCount: exercise.sets.length,
    })),
  });
}

export async function createWorkoutTemplate(input: WorkoutTemplateInput) {
  const cleaned = cleanInput(input);
  const timestamp = new Date().toISOString();
  const template: WorkoutTemplate = {
    ...cleaned,
    id: `template:${crypto.randomUUID()}`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const database = await getDatabase();
  await database.put("workoutTemplates", template);
  return template;
}

export async function updateWorkoutTemplate(
  id: string,
  input: WorkoutTemplateInput,
) {
  const database = await getDatabase();
  const existing = await database.get("workoutTemplates", id);
  if (!existing) throw new Error("Workout template not found");
  const updated: WorkoutTemplate = {
    ...existing,
    ...cleanInput(input),
    updatedAt: new Date().toISOString(),
  };
  await database.put("workoutTemplates", updated);
  return updated;
}

export async function renameWorkoutTemplate(id: string, name: string) {
  const database = await getDatabase();
  const template = await database.get("workoutTemplates", id);
  if (!template) throw new Error("Workout template not found");
  return updateWorkoutTemplate(id, { name, exercises: template.exercises });
}

export async function deleteWorkoutTemplate(id: string) {
  const database = await getDatabase();
  if (!await database.get("workoutTemplates", id)) {
    throw new Error("Workout template not found");
  }
  await database.delete("workoutTemplates", id);
  return id;
}
