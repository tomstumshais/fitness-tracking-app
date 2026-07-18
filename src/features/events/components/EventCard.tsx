import type {
  EditableFitnessEvent,
  FitnessEvent,
} from "../../../domain/fitness.ts";

interface Props {
  event: FitnessEvent;
  onDelete: (event: FitnessEvent) => void;
  onEdit: (event: EditableFitnessEvent) => void;
}

const icons = { running: "🏃", walking: "🚶", cardio: "⚡", resistance: "🏋️" };

function formatPace(durationMinutes: number, distanceKm: number) {
  const totalSeconds = Math.round(durationMinutes * 60 / distanceKm);
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, "0")} /km`;
}

function getTitle(event: FitnessEvent) {
  if (event.type === "cardio" || event.type === "resistance") return event.name;
  return event.type === "running" ? "Running" : "Walking";
}

export function EventCard({ event, onDelete, onEdit }: Props) {
  const editable = event.type !== "resistance" ? event : null;
  return (
    <article className={`event-card ${event.type}`}>
      <div className={`event-card-icon ${event.type}`}>{icons[event.type]}</div>
      <div className="event-card-content">
        <div className="event-card-heading">
          <h2>{getTitle(event)}</h2>
          <span className={`event-kind ${event.type}`}>{event.type}</span>
        </div>
        <div className="event-metrics">
          {event.durationMinutes && (
            <span>
              <strong>{event.durationMinutes}</strong> min
            </span>
          )}
          {event.type === "running" || event.type === "walking"
            ? (
              <>
                <span>
                  <strong>{event.distanceKm}</strong> km
                </span>
                <span>
                  <strong>
                    {formatPace(event.durationMinutes, event.distanceKm)}
                  </strong>
                </span>
              </>
            )
            : event.type === "cardio" && (
              <span>
                <strong>{event.intensity}</strong> intensity
              </span>
            )}
        </div>
        {event.notes && <p className="event-notes">{event.notes}</p>}
        <div className="event-actions">
          {editable && (
            <button onClick={() => onEdit(editable)} type="button">Edit</button>
          )}
          <button
            className="danger-text"
            onClick={() => onDelete(event)}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
