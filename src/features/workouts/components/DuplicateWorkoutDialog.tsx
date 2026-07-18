import { format } from "date-fns";
import { type FormEvent, useState } from "react";
import type { ResistanceEvent } from "../../../domain/fitness.ts";

interface Props {
  event: ResistanceEvent;
  onClose: () => void;
  onDuplicate: (date: string, name: string) => Promise<void>;
}

export function DuplicateWorkoutDialog(props: Props) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [name, setName] = useState(props.event.name);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Use at least 2 characters for the workout name");
      return;
    }
    try {
      setStarting(true);
      await props.onDuplicate(date, name.trim());
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not duplicate workout",
      );
      setStarting(false);
    }
  };

  return (
    <div className="dialog-overlay" role="presentation">
      <section
        aria-labelledby="duplicate-title"
        aria-modal="true"
        className="form-dialog"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Repeat workout</p>
            <h2 id="duplicate-title">Create an editable copy</h2>
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
          <div className="form-field-row">
            <label className="form-field">
              Workout date
              <input
                onChange={(event) => setDate(event.target.value)}
                required
                type="date"
                value={date}
              />
            </label>
            <label className="form-field">
              Workout name
              <input
                maxLength={60}
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </label>
          </div>
          <p className="dialog-help">
            Weights and reps are copied, but every set starts incomplete.
          </p>
          {error && <p className="form-error">{error}</p>}
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
              disabled={starting}
              type="submit"
            >
              {starting ? "Creating…" : "Create copy"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
