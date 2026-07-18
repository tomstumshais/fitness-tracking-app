import { format, isSameDay, isSameMonth } from "date-fns";
import { Link } from "react-router-dom";
import type { FitnessEventType } from "../../domain/fitness.ts";

interface Props {
  day: Date;
  eventTypes: FitnessEventType[];
  month: Date;
}

export function CalendarDayLink({ day, eventTypes, month }: Props) {
  const uniqueTypes = [...new Set(eventTypes)];
  const eventLabel = eventTypes.length === 0
    ? ""
    : `, ${eventTypes.length} completed ${
      eventTypes.length === 1 ? "event" : "events"
    }`;
  return (
    <Link
      aria-label={`${format(day, "EEEE, d MMMM yyyy")}${eventLabel}`}
      className={`calendar-day${isSameMonth(day, month) ? "" : " muted"}${
        isSameDay(day, new Date()) ? " today" : ""
      }`}
      to={`/day/${format(day, "yyyy-MM-dd")}`}
    >
      <span>{format(day, "d")}</span>
      {uniqueTypes.length > 0 && (
        <span aria-hidden="true" className="event-markers">
          {uniqueTypes.map((type) => (
            <i className={`event-marker ${type}`} key={type} />
          ))}
        </span>
      )}
    </Link>
  );
}
