import type { Exercise } from "../../../domain/fitness.ts";
import { equipmentAbbreviation } from "../../../domain/equipment.ts";

interface Props {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
}

export function ExercisePickerResults({ exercises, onSelect }: Props) {
  return (
    <div className="exercise-picker-list">
      {exercises.map((exercise) => (
        <button
          className="exercise-picker-option"
          key={exercise.id}
          onClick={() => onSelect(exercise)}
          type="button"
        >
          <span className={`equipment-icon ${exercise.equipment}`}>
            {equipmentAbbreviation(exercise.equipment)}
          </span>
          <span>
            <strong>{exercise.name}</strong>
            <small>
              {exercise.muscleGroup.replace("-", " ")}
              {exercise.source === "custom" ? " · Custom" : ""}
            </small>
          </span>
          <span aria-hidden="true" className="option-arrow">＋</span>
        </button>
      ))}
      {exercises.length === 0 && (
        <p className="picker-empty">No matching exercises</p>
      )}
    </div>
  );
}
