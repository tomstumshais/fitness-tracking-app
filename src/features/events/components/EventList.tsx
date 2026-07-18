import type {
  EditableFitnessEvent,
  FitnessEvent,
  ResistanceEvent,
} from "../../../domain/fitness.ts";
import { EventCard } from "./EventCard.tsx";

interface Props {
  allEvents: FitnessEvent[];
  events: FitnessEvent[];
  onDelete: (event: FitnessEvent) => void;
  onDuplicate: (event: ResistanceEvent) => void;
  onEdit: (event: EditableFitnessEvent) => void;
  onEditResistance: (event: ResistanceEvent) => void;
  onSaveTemplate: (event: ResistanceEvent) => void;
}

export function EventList(props: Props) {
  return (
    <div className="event-list" aria-label="Completed fitness events">
      {props.events.map((event) => (
        <EventCard
          allEvents={props.allEvents}
          event={event}
          key={event.id}
          onDelete={props.onDelete}
          onDuplicate={props.onDuplicate}
          onEdit={props.onEdit}
          onEditResistance={props.onEditResistance}
          onSaveTemplate={props.onSaveTemplate}
        />
      ))}
    </div>
  );
}
