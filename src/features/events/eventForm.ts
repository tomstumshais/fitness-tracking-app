import { z } from "zod";
import type {
  CardioIntensity,
  EditableFitnessEvent,
  EditableFitnessEventInput,
} from "../../domain/fitness.ts";

export interface EventFormValues {
  name: string;
  durationMinutes: number;
  distanceKm: number;
  intensity: CardioIntensity;
  notes: string;
}

const duration = z.number("Enter the duration").int().min(
  1,
  "Duration must be at least 1 minute",
).max(1440, "Duration must be 24 hours or less");
const notes = z.string().trim().max(500, "Use 500 characters or fewer");

const distanceSchema = z.object({
  durationMinutes: duration,
  distanceKm: z.number("Enter the distance").positive(
    "Distance must be greater than 0",
  ).max(1000, "Distance must be 1,000 km or less"),
  notes,
});

const cardioSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters").max(
    60,
    "Use 60 characters or fewer",
  ),
  durationMinutes: duration,
  intensity: z.enum(["low", "moderate", "high"]),
  notes,
});

export function validateEventForm(
  type: "running" | "walking" | "cardio",
  values: EventFormValues,
) {
  return type === "cardio"
    ? cardioSchema.safeParse(values)
    : distanceSchema.safeParse(values);
}

export function eventToFormValues(
  event: EditableFitnessEvent | null,
  activityName = "Outdoor bicycle",
): EventFormValues {
  return {
    name: event?.type === "cardio" ? event.name : activityName,
    durationMinutes: event?.durationMinutes ?? Number.NaN,
    distanceKm: event?.type !== "cardio"
      ? event?.distanceKm ?? Number.NaN
      : Number.NaN,
    intensity: event?.type === "cardio" ? event.intensity : "moderate",
    notes: event?.notes ?? "",
  };
}

export function formValuesToEvent(
  type: "running" | "walking" | "cardio",
  date: string,
  values: EventFormValues,
): EditableFitnessEventInput {
  const common = {
    date,
    durationMinutes: values.durationMinutes,
    notes: values.notes,
  };
  return type === "cardio"
    ? { ...common, type, name: values.name, intensity: values.intensity }
    : { ...common, type, distanceKm: values.distanceKm };
}
