import { type FormEvent, useState } from "react";

interface Props {
  defaultName: string;
  eyebrow: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  submitLabel: string;
  title: string;
}

export function TemplateNameDialog(props: Props) {
  const [name, setName] = useState(props.defaultName);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const cleaned = name.trim();
    if (cleaned.length < 2 || cleaned.length > 60) {
      setError("Use between 2 and 60 characters");
      return;
    }
    try {
      setSaving(true);
      await props.onSave(cleaned);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save");
      setSaving(false);
    }
  };

  return (
    <div className="dialog-overlay" role="presentation">
      <section
        aria-labelledby="template-name-title"
        aria-modal="true"
        className="form-dialog"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">{props.eyebrow}</p>
            <h2 id="template-name-title">{props.title}</h2>
          </div>
          <button
            aria-label="Close"
            className="dialog-close"
            disabled={saving}
            onClick={props.onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="form-field">
            Template name
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
              onClick={props.onClose}
              type="button"
            >
              Cancel
            </button>
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? "Saving…" : props.submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
