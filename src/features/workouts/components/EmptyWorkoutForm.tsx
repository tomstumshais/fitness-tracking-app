import { type FormEvent, useState } from "react";

interface Props {
  onClose: () => void;
  onStart: (name: string) => Promise<void>;
}

export function EmptyWorkoutForm({ onClose, onStart }: Props) {
  const [name, setName] = useState("Resistance training");
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

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
        <button className="secondary-button" onClick={onClose} type="button">
          Cancel
        </button>
        <button className="primary-button" disabled={starting} type="submit">
          {starting ? "Starting…" : "Start workout"}
        </button>
      </div>
    </form>
  );
}
