import { format, isSameDay, isSameMonth } from "date-fns";
import { Link } from "react-router-dom";
import type { FitnessEventType } from "../../domain/fitness.ts";

interface Props {
  day: Date;
  eventTypes: FitnessEventType[];
  month: Date;
}

const activityNames: Record<
  FitnessEventType,
  { singular: string; plural: string }
> = {
  cardio: { singular: "cardio activity", plural: "cardio activities" },
  running: { singular: "running activity", plural: "running activities" },
  walking: { singular: "walking activity", plural: "walking activities" },
  resistance: {
    singular: "resistance workout",
    plural: "resistance workouts",
  },
};

function activitySummary(eventCounts: Map<FitnessEventType, number>) {
  const descriptions = [...eventCounts].map(([type, count]) =>
    `${count} ${activityNames[type][count === 1 ? "singular" : "plural"]}`
  );
  if (descriptions.length === 0) return "";
  if (descriptions.length === 1) return `, ${descriptions[0]}`;
  return `, ${descriptions.slice(0, -1).join(", ")} and ${
    descriptions[descriptions.length - 1]
  }`;
}

export function CalendarDayLink({ day, eventTypes, month }: Props) {
  const eventCounts = eventTypes.reduce((counts, type) => {
    counts.set(type, (counts.get(type) ?? 0) + 1);
    return counts;
  }, new Map<FitnessEventType, number>());
  const eventLabel = activitySummary(eventCounts);
  return (
    <Link
      aria-label={`${format(day, "EEEE, d MMMM yyyy")}${eventLabel}`}
      className={`calendar-day${isSameMonth(day, month) ? "" : " muted"}${
        isSameDay(day, new Date()) ? " today" : ""
      }`}
      to={`/day/${format(day, "yyyy-MM-dd")}`}
    >
      <span>{format(day, "d")}</span>
      {eventCounts.size > 0 && (
        <span aria-hidden="true" className="event-markers">
          {[...eventCounts].map(([type, count]) => (
            <i
              className={`event-marker ${type}${count > 1 ? " counted" : ""}`}
              key={type}
            >
              {count > 1 ? (count > 2 ? "3+" : count) : null}
            </i>
          ))}
        </span>
      )}
    </Link>
  );
}
