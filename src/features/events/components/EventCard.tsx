import type {
  EditableFitnessEvent,
  FitnessEvent,
  ResistanceEvent,
} from "../../../domain/fitness.ts";
import { getActivityIcon } from "../cardioActivities.ts";
import { ActivityComparison } from "./ActivityComparison.tsx";
import { EventActions } from "./EventActions.tsx";
import { EventMetrics } from "./EventMetrics.tsx";
import { ResistanceEventDetails } from "./ResistanceEventDetails.tsx";

interface Props {
  allEvents: FitnessEvent[];
  event: FitnessEvent;
  onDelete: (event: FitnessEvent) => void;
  onDuplicate: (event: ResistanceEvent) => void;
  onEdit: (event: EditableFitnessEvent) => void;
  onEditResistance: (event: ResistanceEvent) => void;
  onSaveTemplate: (event: ResistanceEvent) => void;
}

const icons = { running: "🏃", walking: "🚶", resistance: "🏋️" };

function getTitle(event: FitnessEvent) {
  if (event.type === "cardio" || event.type === "resistance") return event.name;
  return event.type === "running" ? "Running" : "Walking";
}

function getIcon(event: FitnessEvent) {
  return event.type === "cardio"
    ? getActivityIcon(event.name)
    : icons[event.type];
}

function getKind(event: FitnessEvent) {
  return event.type === "cardio" ? "activity" : event.type;
}

export function EventCard(props: Props) {
  const { allEvents, event } = props;
  return (
    <article className={`event-card ${event.type}`}>
      <div className={`event-card-icon ${event.type}`}>{getIcon(event)}</div>
      <div className="event-card-content">
        <div className="event-card-heading">
          <h2>{getTitle(event)}</h2>
          <span className={`event-kind ${event.type}`}>{getKind(event)}</span>
        </div>
        <EventMetrics event={event} />
        {event.type !== "resistance" && (
          <ActivityComparison event={event} events={allEvents} />
        )}
        {event.type === "resistance" && (
          <ResistanceEventDetails event={event} events={allEvents} />
        )}
        {event.notes && <p className="event-notes">{event.notes}</p>}
        <EventActions {...props} />
      </div>
    </article>
  );
}
