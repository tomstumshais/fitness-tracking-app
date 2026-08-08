import type { WorkoutTemplateExercise } from "../../../domain/fitness.ts";
import {
  equipmentAbbreviation,
  equipmentLabel,
} from "../../../domain/equipment.ts";

interface Props {
  entry: WorkoutTemplateExercise;
  index: number;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
  onSetCount: (count: number) => void;
  total: number;
}

export function TemplateExerciseEditor(props: Props) {
  const { entry } = props;
  return (
    <article className="template-editor-exercise">
      <div className="template-editor-exercise-heading">
        <span className={`equipment-icon ${entry.equipment}`}>
          {equipmentAbbreviation(entry.equipment)}
        </span>
        <div>
          <h3>{entry.exerciseName}</h3>
          <p>{equipmentLabel(entry.equipment)}</p>
        </div>
      </div>
      <div className="template-editor-controls">
        <div className="template-set-stepper">
          <span>Sets</span>
          <button
            aria-label={`Decrease sets for ${entry.exerciseName}`}
            disabled={entry.setCount === 1}
            onClick={() => props.onSetCount(entry.setCount - 1)}
            type="button"
          >
            −
          </button>
          <strong>{entry.setCount}</strong>
          <button
            aria-label={`Increase sets for ${entry.exerciseName}`}
            disabled={entry.setCount === 20}
            onClick={() => props.onSetCount(entry.setCount + 1)}
            type="button"
          >
            ＋
          </button>
        </div>
        <div className="template-order-actions">
          <button
            aria-label={`Move ${entry.exerciseName} up`}
            disabled={props.index === 0}
            onClick={() => props.onMove(-1)}
            type="button"
          >
            ↑
          </button>
          <button
            aria-label={`Move ${entry.exerciseName} down`}
            disabled={props.index === props.total - 1}
            onClick={() => props.onMove(1)}
            type="button"
          >
            ↓
          </button>
        </div>
        <button
          aria-label={`Remove ${entry.exerciseName}`}
          className="template-remove-exercise"
          onClick={props.onRemove}
          type="button"
        >
          Remove
        </button>
      </div>
    </article>
  );
}
