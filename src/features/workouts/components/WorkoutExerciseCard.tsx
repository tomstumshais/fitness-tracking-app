import type {
  ResistanceExerciseEntry,
  ResistanceSet,
} from "../../../domain/fitness.ts";
import { equipmentAbbreviation } from "../../../domain/equipment.ts";
import { ExerciseNoteEditor } from "./ExerciseNoteEditor.tsx";
import { ResistanceProgressStatus } from "./ResistanceProgressStatus.tsx";
import { WorkoutSetTable } from "./WorkoutSetTable.tsx";

interface Props {
  entry: ResistanceExerciseEntry;
  onChangeNotes: (notes: string) => void;
  onChangeSets: (sets: ResistanceSet[]) => void;
  onRemove: () => void;
  previous?: ResistanceExerciseEntry;
}

export function WorkoutExerciseCard(
  { entry, onChangeNotes, onChangeSets, onRemove, previous }: Props,
) {
  return (
    <article className="workout-exercise-card">
      <div className="workout-exercise-heading">
        <span className={`equipment-icon ${entry.equipment}`}>
          {equipmentAbbreviation(entry.equipment)}
        </span>
        <div>
          <h2>{entry.exerciseName}</h2>
          <ResistanceProgressStatus exercise={entry} previous={previous} />
        </div>
        <button
          aria-label={`Remove ${entry.exerciseName}`}
          className="danger-icon"
          onClick={onRemove}
          type="button"
        >
          ×
        </button>
      </div>
      <ExerciseNoteEditor
        exerciseName={entry.exerciseName}
        notes={entry.notes}
        onChange={onChangeNotes}
        previousNotes={previous?.notes}
      />
      <WorkoutSetTable
        entry={entry}
        onChangeSets={onChangeSets}
        previous={previous}
      />
    </article>
  );
}
