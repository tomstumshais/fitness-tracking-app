import type {
  ResistanceExerciseEntry,
  ResistanceSet,
} from "../../../domain/fitness.ts";
import {
  equipmentAbbreviation,
  requiresWeight,
} from "../../../domain/equipment.ts";
import { getProgressSummary } from "../resistanceProgress.ts";
import { ResistanceSetRow } from "./ResistanceSetRow.tsx";

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
  const changeSet = (index: number, set: ResistanceSet) =>
    onChangeSets(
      entry.sets.map((current, itemIndex) =>
        itemIndex === index ? set : current
      ),
    );
  const addSet = () => {
    const last = entry.sets.at(-1);
    onChangeSets([...entry.sets, {
      id: crypto.randomUUID(),
      weightKg: last?.weightKg ?? null,
      repetitions: last?.repetitions ?? 0,
      completed: false,
    }]);
  };
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
      <div
        className="set-table"
        role="table"
        aria-label={`${entry.exerciseName} sets`}
      >
        <div className="set-header" role="row">
          <span>Set</span>
          <span>Previous</span>
          <span>{requiresWeight(entry.equipment) ? "kg" : "Load"}</span>
          <span>Reps</span>
          <span>Done</span>
        </div>
        {entry.sets.map((set, index) => (
          <ResistanceSetRow
            equipment={entry.equipment}
            index={index}
            key={set.id}
            onChange={(updated) => changeSet(index, updated)}
            previous={previous?.sets[index]}
            set={set}
          />
        ))}
      </div>
      {requiresWeight(entry.equipment) && (
        <p className="weight-note">kg is the weight of each dumbbell</p>
      )}
      <div className="set-actions">
        <button className="add-set-button" onClick={addSet} type="button">
          ＋ Add set
        </button>
        {entry.sets.length > 1 && (
          <button
            aria-label={`Remove set ${entry.sets.length}`}
            className="remove-last-set-button"
            onClick={() => onChangeSets(entry.sets.slice(0, -1))}
            type="button"
          >
            − Remove last set
          </button>
        )}
      </div>
    </article>
  );
}
