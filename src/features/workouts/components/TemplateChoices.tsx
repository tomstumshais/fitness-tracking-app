import type { WorkoutTemplate } from "../../../domain/fitness.ts";

interface Props {
  onSelect: (id: string) => void;
  startingId: string | null;
  templates: WorkoutTemplate[];
}

function countSets(template: WorkoutTemplate) {
  return template.exercises.reduce(
    (total, exercise) => total + exercise.setCount,
    0,
  );
}

export function TemplateChoices({ onSelect, startingId, templates }: Props) {
  if (templates.length === 0) return null;
  return (
    <section
      className="setup-template-section"
      aria-labelledby="template-choice-title"
    >
      <h3 id="template-choice-title">Start from template</h3>
      <div className="setup-template-list">
        {templates.map((template) => (
          <button
            className="setup-template-option"
            disabled={startingId !== null}
            key={template.id}
            onClick={() => onSelect(template.id)}
            type="button"
          >
            <span>
              <strong>{template.name}</strong>
              <small>
                {template.exercises.length}{" "}
                {template.exercises.length === 1 ? "exercise" : "exercises"}
                {" · "}
                {countSets(template)}{" "}
                {countSets(template) === 1 ? "set" : "sets"}
              </small>
            </span>
            <span>{startingId === template.id ? "Starting…" : "Start →"}</span>
          </button>
        ))}
      </div>
      <div className="setup-divider">
        <span>or start empty</span>
      </div>
    </section>
  );
}
