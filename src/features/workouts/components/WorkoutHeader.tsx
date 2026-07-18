import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";

interface Props {
  date: string;
  editing: boolean;
  exerciseCount: number;
  name: string;
  onDiscard: () => void;
  onFinish: () => void;
  ready: boolean;
}

export function WorkoutHeader(props: Props) {
  return (
    <>
      <Link className="back-link" to={`/day/${props.date}`}>
        ← {props.editing ? "Return later" : "Save and return"}
      </Link>
      <div className="workout-page-heading">
        <div>
          <p className="eyebrow">
            {format(parseISO(props.date), "EEEE, d MMMM")}
          </p>
          <h1>{props.name}</h1>
          <p className="workout-count">
            {props.exerciseCount}{" "}
            {props.exerciseCount === 1 ? "exercise" : "exercises"}
          </p>
        </div>
        <button
          className="primary-button"
          disabled={!props.ready}
          onClick={props.onFinish}
          type="button"
        >
          {props.editing ? "Save changes" : "Finish workout"}
        </button>
      </div>
      <div className="workout-status-row">
        <span>
          {props.ready
            ? props.editing
              ? "All sets complete · ready to save"
              : "All sets complete · ready to finish"
            : "Enter kg/reps and mark every set done · changes save automatically"}
        </span>
        <button
          className="danger-text-button"
          onClick={props.onDiscard}
          type="button"
        >
          {props.editing ? "Discard changes" : "Discard workout"}
        </button>
      </div>
    </>
  );
}
