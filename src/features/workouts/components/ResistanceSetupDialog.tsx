import { type FormEvent, useEffect, useState } from "react";

interface Props {
  onClose: () => void;
  onStart: (name: string) => Promise<void>;
}

export function ResistanceSetupDialog({ onClose, onStart }: Props) {
  const [name, setName] = useState("Resistance training");
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const cleaned = name.trim();
    if (cleaned.length < 2 || cleaned.length > 60) {
      setError("Use between 2 and 60 characters");
      return;
    }
    try {
      setStarting(true);
      await onStart(cleaned);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not start workout",
      );
      setStarting(false);
    }
  };

  return (
    <div className="dialog-overlay" role="presentation">
      <section
        aria-labelledby="workout-setup-title"
        aria-modal="true"
        className="form-dialog"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Resistance workout</p>
            <h2 id="workout-setup-title">Name your workout</h2>
          </div>
          <button
            aria-label="Close"
            className="dialog-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="form-field">
            Workout name
            <input
              autoFocus
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="dialog-actions">
            <button
              className="secondary-button"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="primary-button"
              disabled={starting}
              type="submit"
            >
              {starting ? "Starting…" : "Start workout"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
