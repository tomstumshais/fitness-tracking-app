import type {
  ResistanceExerciseEntry,
  ResistanceSet,
} from "../../../domain/fitness.ts";
import { equipmentAbbreviation } from "../../../domain/equipment.ts";
import { getProgressSummary } from "../resistanceProgress.ts";
import { WorkoutSetTable } from "./WorkoutSetTable.tsx";

interface Props {
  entry: ResistanceExerciseEntry;
  onChangeSets: (sets: ResistanceSet[]) => void;
  onRemove: () => void;
  previous?: ResistanceExerciseEntry;
}

export function WorkoutExerciseCard(
  { entry, onChangeSets, onRemove, previous }: Props,
) {
  const progress = getProgressSummary(entry, previous);
  return (
    <article className="workout-exercise-card">
      <div className="workout-exercise-heading">
        <span className={`equipment-icon ${entry.equipment}`}>
          {equipmentAbbreviation(entry.equipment)}
        </span>
        <div>
          <h2>{entry.exerciseName}</h2>
          <span className={`progress-label ${progress.tone}`}>
            {progress.label}
          </span>
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
      <WorkoutSetTable
        entry={entry}
        onChangeSets={onChangeSets}
        previous={previous}
      />
    </article>
  );
}
