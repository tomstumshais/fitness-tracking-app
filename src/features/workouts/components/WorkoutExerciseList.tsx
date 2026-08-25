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
  onChangeNotes: (entryId: string, notes: string) => void;
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
          onChangeNotes={(notes) => props.onChangeNotes(entry.id, notes)}
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
