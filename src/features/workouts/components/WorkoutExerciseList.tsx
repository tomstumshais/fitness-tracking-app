import type {
  FitnessEvent,
  ResistanceSet,
  ResistanceWorkoutDraft,
} from "../../../domain/fitness.ts";
import { findPreviousExercise } from "../resistanceProgress.ts";
import { WorkoutExerciseCard } from "./WorkoutExerciseCard.tsx";

interface Props {
  draft: ResistanceWorkoutDraft;
  events: FitnessEvent[];
  onAdd: () => void;
  onChangeSets: (entryId: string, sets: ResistanceSet[]) => void;
  onRemove: (entryId: string) => void;
}

export function WorkoutExerciseList(props: Props) {
  return (
    <div className="workout-exercise-list">
      {props.draft.exercises.map((entry) => (
        <WorkoutExerciseCard
          entry={entry}
          key={entry.id}
          onChangeSets={(sets) => props.onChangeSets(entry.id, sets)}
          onRemove={() => props.onRemove(entry.id)}
          previous={findPreviousExercise(
            props.events,
            props.draft,
            entry.exerciseId,
          )}
        />
      ))}
      <button
        className="secondary-button workout-add-exercise"
        onClick={props.onAdd}
        type="button"
      >
        ＋ Add exercise
      </button>
    </div>
  );
}
