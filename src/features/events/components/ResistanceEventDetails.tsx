import type { FitnessEvent, ResistanceEvent } from "../../../domain/fitness.ts";
import {
  findPreviousExercise,
  getProgressSummary,
} from "../../workouts/resistanceProgress.ts";

interface Props {
  event: ResistanceEvent;
  events: FitnessEvent[];
}

function formatSets(event: ResistanceEvent, exerciseIndex: number) {
  const exercise = event.exercises[exerciseIndex];
  return exercise.sets.map((set) =>
    `${
      exercise.equipment === "bodyweight" ? "BW" : `${set.weightKg} kg`
    } × ${set.repetitions}`
  ).join(" · ");
}

export function ResistanceEventDetails({ event, events }: Props) {
  return (
    <div className="resistance-event-details">
      {event.exercises.map((exercise, index) => {
        const previous = findPreviousExercise(
          events,
          event,
          exercise.exerciseId,
        );
        const progress = getProgressSummary(exercise, previous);
        return (
          <div className="resistance-event-exercise" key={exercise.id}>
            <div>
              <strong>{exercise.exerciseName}</strong>
              <small>{formatSets(event, index)}</small>
            </div>
            <span className={`progress-label ${progress.tone}`}>
              {progress.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
