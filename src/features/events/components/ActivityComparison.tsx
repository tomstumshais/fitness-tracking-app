import type {
  EditableFitnessEvent,
  FitnessEvent,
} from "../../../domain/fitness.ts";
import {
  findPreviousActivity,
  formatActivityMetrics,
  getActivityProgress,
} from "../activityProgress.ts";

interface Props {
  event: EditableFitnessEvent;
  events: FitnessEvent[];
}

export function ActivityComparison({ event, events }: Props) {
  const previous = findPreviousActivity(events, event);
  if (!previous) {
    return (
      <div className="activity-comparison">
        <span className="progress-label neutral">First recorded session</span>
      </div>
    );
  }
  const progress = getActivityProgress(event, previous);
  return (
    <div
      aria-label={`Comparison with previous ${
        event.type === "cardio" ? event.name : event.type
      } session`}
      className="activity-comparison"
    >
      <div className="activity-previous">
        <span>Previous</span>
        <strong>{formatActivityMetrics(previous)}</strong>
      </div>
      <div className="activity-progress">
        <span className={`progress-label ${progress.tone}`}>
          {progress.label}
        </span>
        {progress.change && <small>{progress.change}</small>}
      </div>
    </div>
  );
}
