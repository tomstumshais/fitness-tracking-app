import { format } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import type { WorkoutTemplate } from "../../domain/fitness.ts";
import { startWorkoutFromTemplate } from "../workouts/workoutsSlice.ts";
import { TemplateNameDialog } from "./components/TemplateNameDialog.tsx";
import { WorkoutTemplateCard } from "./components/WorkoutTemplateCard.tsx";
import {
  removeTemplate,
  renameTemplate,
  selectAllTemplates,
} from "./templatesSlice.ts";

export function TemplatesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const templates = useAppSelector(selectAllTemplates);
  const [renaming, setRenaming] = useState<WorkoutTemplate | null>(null);

  const start = async (templateId: string) => {
    const draft = await dispatch(startWorkoutFromTemplate({
      date: format(new Date(), "yyyy-MM-dd"),
      templateId,
    })).unwrap();
    navigate(`/workout/${draft.id}`);
  };
  const remove = async (template: WorkoutTemplate) => {
    if (globalThis.confirm(`Delete template “${template.name}”?`)) {
      await dispatch(removeTemplate(template.id)).unwrap();
    }
  };

  return (
    <section className="page templates-page">
      <p className="eyebrow">Reusable routines</p>
      <h1>Templates</h1>
      <p className="page-intro">
        Save a completed resistance workout as a template, then use its exercise
        order and set counts on any training day.
      </p>
      {templates.length === 0
        ? (
          <EmptyState
            description="Open a completed resistance workout and choose Save as template."
            icon="▤"
            title="No workout templates"
          />
        )
        : (
          <div className="template-grid">
            {templates.map((template) => (
              <WorkoutTemplateCard
                key={template.id}
                onDelete={() => void remove(template)}
                onRename={() => setRenaming(template)}
                onStart={() => void start(template.id)}
                template={template}
              />
            ))}
          </div>
        )}
      {renaming && (
        <TemplateNameDialog
          defaultName={renaming.name}
          eyebrow="Edit template"
          onClose={() => setRenaming(null)}
          onSave={async (name) => {
            await dispatch(renameTemplate({ id: renaming.id, name })).unwrap();
            setRenaming(null);
          }}
          submitLabel="Save name"
          title="Rename template"
        />
      )}
    </section>
  );
}
