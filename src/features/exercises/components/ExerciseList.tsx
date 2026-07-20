import type { Exercise } from "../../../domain/fitness.ts";
import {
  equipmentAbbreviation,
  equipmentLabel,
} from "../../../domain/equipment.ts";
import { muscleGroupLabel } from "../exerciseOptions.ts";

interface ExerciseListProps {
  exercises: Exercise[];
  onDelete: (exercise: Exercise) => void;
  onEdit: (exercise: Exercise) => void;
}

export function ExerciseList(
  { exercises, onDelete, onEdit }: ExerciseListProps,
) {
  if (exercises.length === 0) {
    return (
      <div className="exercise-empty">
        <span aria-hidden="true">⌕</span>
        <h2>No exercises found</h2>
        <p>Try another search or filter, or create a custom exercise.</p>
      </div>
    );
  }

  return (
    <div className="exercise-grid">
      {exercises.map((exercise) => (
        <article className="exercise-card" key={exercise.id}>
          <span
            className={`equipment-icon ${exercise.equipment}`}
            aria-hidden="true"
          >
            {equipmentAbbreviation(exercise.equipment)}
          </span>
          <div className="exercise-card-content">
            <div className="exercise-title-row">
              <h2>{exercise.name}</h2>
              {exercise.source === "custom" && (
                <span className="custom-badge">Custom</span>
              )}
            </div>
            <p>
              {muscleGroupLabel(exercise.muscleGroup)} ·{" "}
              {equipmentLabel(exercise.equipment)}
            </p>
          </div>
          {exercise.source === "custom" && (
            <div className="exercise-actions">
              <button onClick={() => onEdit(exercise)} type="button">
                Edit
              </button>
              <button
                className="danger-text"
                onClick={() =>
                  onDelete(exercise)}
                type="button"
              >
                Delete
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
