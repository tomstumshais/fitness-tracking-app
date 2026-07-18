import type {
  EditableFitnessEvent,
  FitnessEvent,
} from "../../../domain/fitness.ts";
import { EventCard } from "./EventCard.tsx";

interface Props {
  allEvents: FitnessEvent[];
  events: FitnessEvent[];
  onDelete: (event: FitnessEvent) => void;
  onEdit: (event: EditableFitnessEvent) => void;
}

export function EventList({ allEvents, events, onDelete, onEdit }: Props) {
  return (
    <div className="event-list" aria-label="Completed fitness events">
      {events.map((event) => (
        <EventCard
          allEvents={allEvents}
          event={event}
          key={event.id}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
