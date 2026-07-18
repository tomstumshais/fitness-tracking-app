import type { WorkoutTemplate } from "../../../domain/fitness.ts";

interface Props {
  onDelete: () => void;
  onRename: () => void;
  onStart: () => void;
  template: WorkoutTemplate;
}

export function WorkoutTemplateCard(props: Props) {
  const setCount = props.template.exercises.reduce(
    (total, exercise) => total + exercise.setCount,
    0,
  );
  return (
    <article className="template-card">
      <div className="template-card-heading">
        <div>
          <p className="eyebrow">Workout template</p>
          <h2>{props.template.name}</h2>
        </div>
        <span className="template-count">
          {props.template.exercises.length}{" "}
          {props.template.exercises.length === 1 ? "exercise" : "exercises"}
          {" · "}
          {setCount} {setCount === 1 ? "set" : "sets"}
        </span>
      </div>
      <ul className="template-exercise-list">
        {props.template.exercises.map((exercise) => (
          <li key={exercise.id}>
            <span>{exercise.exerciseName}</span>
            <small>
              {exercise.setCount} {exercise.setCount === 1 ? "set" : "sets"}
            </small>
          </li>
        ))}
      </ul>
      <div className="template-card-actions">
        <button
          className="primary-button"
          onClick={props.onStart}
          type="button"
        >
          Start today
        </button>
        <button className="text-action" onClick={props.onRename} type="button">
          Rename
        </button>
        <button
          className="text-action danger-text"
          onClick={props.onDelete}
          type="button"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
