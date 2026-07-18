import { useEffect } from "react";
import type {
  EditableFitnessEvent,
  EditableFitnessEventInput,
} from "../../../domain/fitness.ts";
import { useEventForm } from "../useEventForm.ts";
import { EventFormFields } from "./EventFormFields.tsx";

interface Props {
  activityName?: string;
  date: string;
  event: EditableFitnessEvent | null;
  onClose: () => void;
  onSave: (input: EditableFitnessEventInput) => Promise<void>;
  type: "running" | "walking" | "cardio";
}

const labels = { running: "Run", walking: "Walk", cardio: "Cardio" };

export function EventFormDialog(props: Props) {
  const form = useEventForm(props);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && props.onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [props.onClose]);

  return (
    <div className="dialog-overlay" role="presentation">
      <section
        aria-labelledby="event-dialog-title"
        aria-modal="true"
        className="form-dialog"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Completed activity</p>
            <h2 id="event-dialog-title">
              {props.event
                ? `Edit ${
                  props.event.type === "cardio"
                    ? props.event.name
                    : labels[props.type]
                }`
                : `Log ${
                  props.type === "cardio"
                    ? props.activityName ?? labels.cardio
                    : labels[props.type]
                }`}
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
        <form onSubmit={form.submit}>
          <EventFormFields form={form} type={props.type} />
          {form.formState.errors.root && (
            <p className="form-error">{form.formState.errors.root.message}</p>
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
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? "Saving…" : "Save event"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
