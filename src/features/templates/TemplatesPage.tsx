import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import type { WorkoutTemplate } from "../../domain/fitness.ts";
import { startWorkoutFromTemplate } from "../workouts/workoutsSlice.ts";
import { WorkoutTemplateCard } from "./components/WorkoutTemplateCard.tsx";
import { removeTemplate, selectAllTemplates } from "./templatesSlice.ts";

export function TemplatesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const templates = useAppSelector(selectAllTemplates);

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
      <div className="template-page-heading">
        <div>
          <p className="eyebrow">Reusable routines</p>
          <h1>Templates</h1>
        </div>
        <Link className="primary-button" to="/templates/new">
          + New template
        </Link>
      </div>
      <p className="page-intro">
        Build a routine before training or save a completed resistance workout,
        then reuse its exercise order and set counts on any day.
      </p>
      {templates.length === 0
        ? (
          <EmptyState
            description="Create a routine now or save a completed resistance workout as a template."
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
                onEdit={() => navigate(`/templates/${template.id}/edit`)}
                onStart={() => void start(template.id)}
                template={template}
              />
            ))}
          </div>
        )}
    </section>
  );
}
