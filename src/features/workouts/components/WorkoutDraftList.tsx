import { Link } from "react-router-dom";
import type { ResistanceWorkoutDraft } from "../../../domain/fitness.ts";

export function WorkoutDraftList(
  { drafts }: { drafts: ResistanceWorkoutDraft[] },
) {
  if (drafts.length === 0) return null;
  return (
    <div className="draft-list">
      {drafts.map((draft) => (
        <article className="draft-banner" key={draft.id}>
          <span className="draft-icon">🏋️</span>
          <div>
            <p className="eyebrow">Workout in progress</p>
            <h2>{draft.name}</h2>
            <small>
              {draft.exercises.length}{" "}
              {draft.exercises.length === 1 ? "exercise" : "exercises"}
            </small>
          </div>
          <Link
            className="secondary-button draft-resume"
            to={`/workout/${draft.id}`}
          >
            Resume
          </Link>
        </article>
      ))}
    </div>
  );
}
