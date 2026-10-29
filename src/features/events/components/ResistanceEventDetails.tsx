import type { FitnessEvent, ResistanceEvent } from "../../../domain/fitness.ts";
import { equipmentSetLabel } from "../../../domain/equipment.ts";
import { findPreviousExercise } from "../../workouts/resistanceProgress.ts";
import { ResistanceProgressStatus } from "../../workouts/components/ResistanceProgressStatus.tsx";

interface Props {
  event: ResistanceEvent;
  events: FitnessEvent[];
}

function formatSets(event: ResistanceEvent, exerciseIndex: number) {
  const exercise = event.exercises[exerciseIndex];
  return exercise.sets.map((set) =>
    `${
      equipmentSetLabel(exercise.equipment) ?? `${set.weightKg} kg`
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
        return (
          <div className="resistance-event-exercise" key={exercise.id}>
            <div>
              <strong>{exercise.exerciseName}</strong>
              <small>{formatSets(event, index)}</small>
              {exercise.notes && (
                <p className="completed-exercise-note">{exercise.notes}</p>
              )}
            </div>
            <ResistanceProgressStatus exercise={exercise} previous={previous} />
          </div>
        );
      })}
    </div>
  );
}
