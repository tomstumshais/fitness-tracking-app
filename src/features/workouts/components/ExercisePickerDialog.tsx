import { useEffect, useMemo, useState } from "react";
import type { Equipment, Exercise } from "../../../domain/fitness.ts";
import { ExercisePickerResults } from "./ExercisePickerResults.tsx";

interface Props {
  exercises: Exercise[];
  existingIds: string[];
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function ExercisePickerDialog(props: Props) {
  const [query, setQuery] = useState("");
  const [equipment, setEquipment] = useState<Equipment | "all">("all");
  const results = useMemo(
    () =>
      props.exercises.filter((exercise) =>
        !props.existingIds.includes(exercise.id) &&
        (equipment === "all" || exercise.equipment === equipment) &&
        exercise.name.toLocaleLowerCase().includes(
          query.trim().toLocaleLowerCase(),
        )
      ),
    [equipment, props.exercises, props.existingIds, query],
  );

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && props.onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [props.onClose]);

  return (
    <div className="dialog-overlay" role="presentation">
      <section
        aria-labelledby="exercise-picker-title"
        aria-modal="true"
        className="form-dialog exercise-picker"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Resistance workout</p>
            <h2 id="exercise-picker-title">Add exercise</h2>
          </div>
          <button
            aria-label="Close"
            className="dialog-close"
            onClick={props.onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search workout exercises"
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search exercises"
            type="search"
            value={query}
          />
        </label>
        <div className="filter-chips workout-filters">
          {(["all", "dumbbell", "bodyweight"] as const).map((item) => (
            <button
              className={`filter-chip${equipment === item ? " active" : ""}`}
              key={item}
              onClick={() => setEquipment(item)}
              type="button"
            >
              {item === "all"
                ? "All"
                : item === "dumbbell"
                ? "Dumbbells"
                : "Bodyweight"}
            </button>
          ))}
        </div>
        <ExercisePickerResults exercises={results} onSelect={props.onSelect} />
      </section>
    </div>
  );
}
