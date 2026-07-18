import type { FitnessEvent } from "../domain/fitness.ts";
import { normalizeActivityName } from "../domain/activityNames.ts";

export function normalizeEventActivityName(
  event: FitnessEvent,
  updatedAt = new Date().toISOString(),
): FitnessEvent {
  if (event.type !== "cardio") return event;
  const name = normalizeActivityName(event.name);
  return name === event.name ? event : { ...event, name, updatedAt };
}
