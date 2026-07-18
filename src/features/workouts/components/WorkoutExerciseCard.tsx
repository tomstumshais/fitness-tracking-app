import type {
  ResistanceExerciseEntry,
  ResistanceSet,
} from "../../../domain/fitness.ts";
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
          {entry.equipment === "dumbbell" ? "DB" : "BW"}
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
          <span>kg</span>
          <span>Reps</span>
          <span>Done</span>
        </div>
        {entry.sets.map((set, index) => (
          <ResistanceSetRow
            canRemove={entry.sets.length > 1}
            equipment={entry.equipment}
            index={index}
            key={set.id}
            onChange={(updated) => changeSet(index, updated)}
            onRemove={() =>
              onChangeSets(entry.sets.filter((item) => item.id !== set.id))}
            previous={previous?.sets[index]}
            set={set}
          />
        ))}
      </div>
      {entry.equipment === "dumbbell" && (
        <p className="weight-note">kg is the weight of each dumbbell</p>
      )}
      <button className="add-set-button" onClick={addSet} type="button">
        ＋ Add set
      </button>
    </article>
  );
}
