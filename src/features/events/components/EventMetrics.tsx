import type { FitnessEvent } from "../../../domain/fitness.ts";
import { formatPace } from "../activityProgress.ts";

export function EventMetrics({ event }: { event: FitnessEvent }) {
  const setCount = event.type === "resistance"
    ? event.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    )
    : 0;
  return (
    <div className="event-metrics">
      {event.durationMinutes && (
        <span>
          <strong>{event.durationMinutes}</strong> min
        </span>
      )}
      {event.type === "running" || event.type === "walking"
        ? (
          <>
            <span>
              <strong>{event.distanceKm}</strong> km
            </span>
            <span>
              <strong>
                {formatPace(event.durationMinutes, event.distanceKm)}
              </strong>
            </span>
          </>
        )
        : event.type === "cardio"
        ? (
          <span>
            <strong>{event.intensity}</strong> intensity
          </span>
        )
        : event.type === "resistance" && (
          <>
            <span>
              <strong>{event.exercises.length}</strong>{" "}
              {event.exercises.length === 1 ? "exercise" : "exercises"}
            </span>
            <span>
              <strong>{setCount}</strong> {setCount === 1 ? "set" : "sets"}
            </span>
          </>
        )}
    </div>
  );
}
