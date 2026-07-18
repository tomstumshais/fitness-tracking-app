import type {
  EditableFitnessEvent,
  EditableFitnessEventInput,
  FitnessEvent,
} from "../domain/fitness.ts";
import { normalizeActivityName } from "../domain/activityNames.ts";
import { getDatabase } from "./database.ts";

function cleanOptionalText(value?: string) {
  const cleaned = value?.trim().replace(/\s+/g, " ");
  return cleaned || undefined;
}

function sortEvents(events: FitnessEvent[]) {
  return events.sort((left, right) =>
    left.date.localeCompare(right.date) ||
    left.createdAt.localeCompare(right.createdAt)
  );
}

function buildEvent(
  input: EditableFitnessEventInput,
  existing?: EditableFitnessEvent,
): EditableFitnessEvent {
  const timestamp = new Date().toISOString();
  const metadata = {
    id: existing?.id ?? `event:${crypto.randomUUID()}`,
    notes: cleanOptionalText(input.notes),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  return input.type === "cardio"
    ? {
      ...input,
      ...metadata,
      name: normalizeActivityName(input.name.trim().replace(/\s+/g, " ")),
    }
    : { ...input, ...metadata };
}

export async function listFitnessEvents() {
  const database = await getDatabase();
  return sortEvents(await database.getAll("fitnessEvents"));
}

export async function listEventsByDate(date: string) {
  const database = await getDatabase();
  return sortEvents(
    await database.getAllFromIndex(
      "fitnessEvents",
      "by-date",
      date,
    ),
  );
}

export async function createFitnessEvent(input: EditableFitnessEventInput) {
  const event = buildEvent(input);
  const database = await getDatabase();
  await database.put("fitnessEvents", event);
  return event;
}

export async function updateFitnessEvent(
  id: string,
  input: EditableFitnessEventInput,
) {
  const database = await getDatabase();
  const existing = await database.get("fitnessEvents", id);
  if (!existing || existing.type === "resistance") {
    throw new Error("Fitness event not found");
  }

  const event = buildEvent(input, existing);
  await database.put("fitnessEvents", event);
  return event;
}

export async function deleteFitnessEvent(id: string) {
  const database = await getDatabase();
  const existing = await database.get("fitnessEvents", id);
  if (!existing) throw new Error("Fitness event not found");
  await database.delete("fitnessEvents", id);
  return id;
}
