import type {
  EditableFitnessEvent,
  FitnessEvent,
} from "../../domain/fitness.ts";

type ProgressTone = "neutral" | "positive" | "matched" | "lower";

export interface ActivityProgressSummary {
  change?: string;
  label: string;
  tone: ProgressTone;
}

function isEarlier(
  candidate: EditableFitnessEvent,
  current: EditableFitnessEvent,
) {
  return candidate.date < current.date ||
    (candidate.date === current.date &&
      candidate.createdAt < current.createdAt);
}

function isSameActivity(
  candidate: EditableFitnessEvent,
  current: EditableFitnessEvent,
) {
  if (candidate.type !== current.type) return false;
  return candidate.type !== "cardio" || current.type !== "cardio" ||
    candidate.name.toLocaleLowerCase() === current.name.toLocaleLowerCase();
}

export function findPreviousActivity(
  events: FitnessEvent[],
  current: EditableFitnessEvent,
) {
  return events
    .filter((event): event is EditableFitnessEvent =>
      event.type !== "resistance" && event.id !== current.id &&
      isSameActivity(event, current) && isEarlier(event, current)
    )
    .sort((left, right) =>
      right.date.localeCompare(left.date) ||
      right.createdAt.localeCompare(left.createdAt)
    )[0];
}

export function formatPace(durationMinutes: number, distanceKm: number) {
  const seconds = Math.round(durationMinutes * 60 / distanceKm);
  return `${Math.floor(seconds / 60)}:${
    String(seconds % 60).padStart(2, "0")
  } /km`;
}

export function formatActivityMetrics(event: EditableFitnessEvent) {
  if (event.type === "cardio") {
    const intensity = event.intensity[0].toUpperCase() +
      event.intensity.slice(1);
    return `${event.durationMinutes} min · ${intensity} intensity`;
  }
  return `${event.distanceKm} km · ${event.durationMinutes} min · ${
    formatPace(event.durationMinutes, event.distanceKm)
  }`;
}

function signed(value: number, unit: string) {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded > 0 ? "+" : ""}${rounded} ${unit}`;
}

function durationChange(
  current: EditableFitnessEvent,
  previous: EditableFitnessEvent,
) {
  const difference = current.durationMinutes - previous.durationMinutes;
  const percent = Math.round(difference / previous.durationMinutes * 100);
  return `${signed(difference, "min")} (${percent > 0 ? "+" : ""}${percent}%)`;
}

function cardioProgress(
  current: Extract<EditableFitnessEvent, { type: "cardio" }>,
  previous: Extract<EditableFitnessEvent, { type: "cardio" }>,
): ActivityProgressSummary {
  if (current.name.toLocaleLowerCase() === "physiotherapy") {
    return { label: "Previous appointment", tone: "neutral" };
  }
  const change = durationChange(current, previous);
  const durationDifference = current.durationMinutes - previous.durationMinutes;
  const intensity = { low: 1, moderate: 2, high: 3 };
  const intensityDifference = intensity[current.intensity] -
    intensity[previous.intensity];

  if (intensityDifference === 0) {
    if (durationDifference > 0) {
      return { change, label: "Longer at same intensity", tone: "positive" };
    }
    if (durationDifference < 0) {
      return { change, label: "Shorter at same intensity", tone: "lower" };
    }
    return { change, label: "Matched previous", tone: "matched" };
  }
  if (intensityDifference > 0) {
    return durationDifference >= 0
      ? { change, label: "Higher intensity", tone: "positive" }
      : { change, label: "Higher intensity, shorter", tone: "neutral" };
  }
  return durationDifference > 0
    ? { change, label: "Longer, lower intensity", tone: "neutral" }
    : { change, label: "Lower intensity", tone: "lower" };
}

function paceSeconds(
  event: Extract<EditableFitnessEvent, {
    type: "running" | "walking";
  }>,
) {
  return Math.round(event.durationMinutes * 60 / event.distanceKm);
}

function distanceProgress(
  current: Extract<EditableFitnessEvent, { type: "running" | "walking" }>,
  previous: Extract<EditableFitnessEvent, { type: "running" | "walking" }>,
): ActivityProgressSummary {
  const distanceDifference = current.distanceKm - previous.distanceKm;
  const paceDifference = paceSeconds(previous) - paceSeconds(current);
  const changeParts = distanceDifference === 0
    ? []
    : [signed(distanceDifference, "km")];
  if (paceDifference !== 0) {
    const seconds = Math.abs(paceDifference);
    changeParts.push(
      `${Math.floor(seconds / 60)}:${
        String(seconds % 60).padStart(2, "0")
      } /km ${paceDifference > 0 ? "faster" : "slower"}`,
    );
  }
  const change = changeParts.join(" · ") || durationChange(current, previous);

  if (paceDifference > 0 && distanceDifference > 0) {
    return { change, label: "Farther with faster pace", tone: "positive" };
  }
  if (paceDifference > 0) {
    return { change, label: "Faster pace", tone: "positive" };
  }
  if (paceDifference === 0 && distanceDifference > 0) {
    return { change, label: "Farther at same pace", tone: "positive" };
  }
  if (paceDifference === 0 && distanceDifference === 0) {
    return { change, label: "Matched previous", tone: "matched" };
  }
  if (distanceDifference > 0) {
    return { change, label: "Farther session", tone: "neutral" };
  }
  return { change, label: "Slower pace", tone: "lower" };
}

export function getActivityProgress(
  current: EditableFitnessEvent,
  previous: EditableFitnessEvent,
) {
  return current.type === "cardio" && previous.type === "cardio"
    ? cardioProgress(current, previous)
    : current.type !== "cardio" && previous.type !== "cardio"
    ? distanceProgress(current, previous)
    : { label: "Previous session", tone: "neutral" as const };
}
