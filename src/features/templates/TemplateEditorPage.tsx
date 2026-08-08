import { type FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ExercisePickerDialog } from "../workouts/components/ExercisePickerDialog.tsx";
import { TemplateExerciseEditor } from "./components/TemplateExerciseEditor.tsx";
import { useTemplateEditor } from "./useTemplateEditor.ts";

export function TemplateEditorPage() {
  const { templateId } = useParams();
  const editor = useTemplateEditor(templateId);
  if (templateId && editor.status === "succeeded" && !editor.template) {
    return <Navigate replace to="/templates" />;
  }
  if (!editor.ready) {
    return (
      <section className="page">
        <p>Loading template…</p>
      </section>
    );
  }
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void editor.save();
  };
  return (
    <section className="page template-editor-page">
      <Link className="back-link" to="/templates">← Templates</Link>
      <p className="eyebrow">Reusable routine</p>
      <h1>{templateId ? "Edit template" : "New template"}</h1>
      <p className="page-intro">
        Choose exercise order and set counts. Kg and reps stay guided by your
        previous workouts.
      </p>
      <form className="template-editor-form" onSubmit={submit}>
        <label className="form-field">
          Template name
          <input
            autoFocus={!templateId}
            maxLength={60}
            onChange={(event) => editor.setName(event.target.value)}
            placeholder="For example: Upper body"
            value={editor.name}
          />
        </label>
        <section className="template-editor-exercises">
          <div className="template-editor-section-heading">
            <div>
              <h2>Exercises</h2>
              <p>{editor.entries.length} in this template</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => editor.setPickerOpen(true)}
              type="button"
            >
              + Add exercise
            </button>
          </div>
          {editor.entries.length === 0 && (
            <p className="template-editor-empty">
              Add the first exercise to build this routine.
            </p>
          )}
          <div className="template-editor-list">
            {editor.entries.map((entry, index) => (
              <TemplateExerciseEditor
                entry={entry}
                index={index}
                key={entry.id}
                onMove={(offset) => editor.move(index, offset)}
                onRemove={() => editor.remove(entry.id)}
                onSetCount={(count) => editor.setCount(entry.id, count)}
                total={editor.entries.length}
              />
            ))}
          </div>
        </section>
        {editor.error && <p className="form-error">{editor.error}</p>}
        <div className="template-editor-actions">
          <Link className="secondary-button" to="/templates">Cancel</Link>
          <button
            className="primary-button"
            disabled={editor.saving}
            type="submit"
          >
            {editor.saving ? "Saving…" : "Save template"}
          </button>
        </div>
      </form>
      {editor.pickerOpen && (
        <ExercisePickerDialog
          eyebrow="Workout template"
          exercises={editor.exercises}
          existingIds={editor.entries.map((entry) => entry.exerciseId)}
          onClose={() => editor.setPickerOpen(false)}
          onSelect={editor.addExercise}
        />
      )}
    </section>
  );
}
