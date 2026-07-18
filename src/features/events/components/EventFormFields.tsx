import type { UseFormReturn } from "react-hook-form";
import type { EventFormValues } from "../eventForm.ts";

interface Props {
  form: UseFormReturn<EventFormValues>;
  type: "running" | "walking" | "cardio";
}

export function EventFormFields({ form, type }: Props) {
  const { register, formState: { errors } } = form;
  return (
    <>
      {type === "cardio" && (
        <label className="form-field">
          Activity name
          <input autoFocus {...register("name")} placeholder="Example: HIIT" />
          {errors.name && (
            <span className="field-error">{errors.name.message}</span>
          )}
        </label>
      )}
      <div className="form-field-row">
        <label className="form-field">
          Duration (minutes)
          <input
            autoFocus={type !== "cardio"}
            inputMode="numeric"
            min="1"
            type="number"
            {...register("durationMinutes", { valueAsNumber: true })}
          />
          {errors.durationMinutes && (
            <span className="field-error">
              {errors.durationMinutes.message}
            </span>
          )}
        </label>
        {type === "cardio"
          ? (
            <label className="form-field">
              Intensity
              <select {...register("intensity")}>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </label>
          )
          : (
            <label className="form-field">
              Distance (km)
              <input
                inputMode="decimal"
                min="0.1"
                step="0.1"
                type="number"
                {...register("distanceKm", { valueAsNumber: true })}
              />
              {errors.distanceKm && (
                <span className="field-error">{errors.distanceKm.message}</span>
              )}
            </label>
          )}
      </div>
      <label className="form-field notes-field">
        Notes (optional)
        <textarea
          {...register("notes")}
          placeholder="How did it feel?"
          rows={3}
        />
        {errors.notes && (
          <span className="field-error">{errors.notes.message}</span>
        )}
      </label>
    </>
  );
}
