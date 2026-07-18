import type { WorkoutTemplate } from "../domain/fitness.ts";
import { getDatabase } from "./database.ts";

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ");
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
  const timestamp = new Date().toISOString();
  const template: WorkoutTemplate = {
    id: `template:${crypto.randomUUID()}`,
    name: cleanName(name),
    exercises: event.exercises.map((exercise) => ({
      id: crypto.randomUUID(),
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      equipment: exercise.equipment,
      setCount: exercise.sets.length,
    })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await database.put("workoutTemplates", template);
  return template;
}

export async function renameWorkoutTemplate(id: string, name: string) {
  const database = await getDatabase();
  const template = await database.get("workoutTemplates", id);
  if (!template) throw new Error("Workout template not found");
  const updated = {
    ...template,
    name: cleanName(name),
    updatedAt: new Date().toISOString(),
  };
  await database.put("workoutTemplates", updated);
  return updated;
}

export async function deleteWorkoutTemplate(id: string) {
  const database = await getDatabase();
  if (!await database.get("workoutTemplates", id)) {
    throw new Error("Workout template not found");
  }
  await database.delete("workoutTemplates", id);
  return id;
}
