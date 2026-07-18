import { useEffect, useState } from "react";
import type { WorkoutTemplate } from "../../../domain/fitness.ts";
import { EmptyWorkoutForm } from "./EmptyWorkoutForm.tsx";
import { TemplateChoices } from "./TemplateChoices.tsx";

interface Props {
  onClose: () => void;
  onStart: (name: string) => Promise<void>;
  onStartTemplate: (templateId: string) => Promise<void>;
  templates: WorkoutTemplate[];
}

export function ResistanceSetupDialog({
  onClose,
  onStart,
  onStartTemplate,
  templates,
}: Props) {
  const [error, setError] = useState("");
  const [startingTemplate, setStartingTemplate] = useState<string | null>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const startTemplate = async (templateId: string) => {
    try {
      setStartingTemplate(templateId);
      await onStartTemplate(templateId);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not start template",
      );
      setStartingTemplate(null);
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
            <h2 id="workout-setup-title">Start a workout</h2>
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
        <TemplateChoices
          onSelect={(id) => void startTemplate(id)}
          startingId={startingTemplate}
          templates={templates}
        />
        {error && <p className="form-error">{error}</p>}
        <EmptyWorkoutForm onClose={onClose} onStart={onStart} />
      </section>
    </div>
  );
}
