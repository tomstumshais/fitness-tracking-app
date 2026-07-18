import { useEffect } from "react";
import type { CustomExerciseInput, Exercise } from "../../../domain/fitness.ts";
import { muscleGroupOptions } from "../exerciseOptions.ts";
import { useCustomExerciseForm } from "../useCustomExerciseForm.ts";

interface CustomExerciseDialogProps {
  exercise: Exercise | null;
  onClose: () => void;
  onSave: (input: CustomExerciseInput) => Promise<void>;
  open: boolean;
}

export function CustomExerciseDialog(props: CustomExerciseDialogProps) {
  const { register, formState, submit } = useCustomExerciseForm(props);

  useEffect(() => {
    if (!props.open) return;
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && props.onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [props.onClose, props.open]);

  if (!props.open) return null;

  return (
    <div className="dialog-overlay" role="presentation">
      <section
        aria-labelledby="exercise-dialog-title"
        aria-modal="true"
        className="form-dialog"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Exercise library</p>
            <h2 id="exercise-dialog-title">
              {props.exercise ? "Edit exercise" : "Custom exercise"}
            </h2>
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
        <form onSubmit={submit}>
          <label className="form-field">
            Exercise name<input
              autoFocus
              {...register("name")}
              placeholder="Example: Dumbbell Sumo Squat"
            />
          </label>
          {formState.errors.name && (
            <p className="field-error">{formState.errors.name.message}</p>
          )}
          <div className="form-field-row">
            <label className="form-field">
              Equipment<select {...register("equipment")}>
                <option value="dumbbell">Dumbbells</option>
                <option value="bodyweight">Bodyweight</option>
              </select>
            </label>
            <label className="form-field">
              Muscle group<select {...register("muscleGroup")}>
                {muscleGroupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {formState.errors.root && (
            <p className="form-error">{formState.errors.root.message}</p>
          )}
          <div className="dialog-actions">
            <button
              className="secondary-button"
              onClick={props.onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="primary-button"
              disabled={formState.isSubmitting}
              type="submit"
            >
              {formState.isSubmitting ? "Saving…" : "Save exercise"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
