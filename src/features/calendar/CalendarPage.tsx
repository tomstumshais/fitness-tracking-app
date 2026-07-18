import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../app/hooks.ts";
import { selectAllEvents } from "../events/eventsSlice.ts";
import { CalendarDayLink } from "./CalendarDayLink.tsx";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarPage() {
  const { month = "" } = useParams();
  const monthDate = parseISO(`${month}-01`);
  const events = useAppSelector(selectAllEvents);

  if (!/^\d{4}-\d{2}$/.test(month) || !isValid(monthDate)) {
    return (
      <Navigate to={`/calendar/${format(new Date(), "yyyy-MM")}`} replace />
    );
  }

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 }),
  });
  return (
    <section className="page calendar-page">
      <div className="calendar-heading">
        <div>
          <p className="eyebrow">Your activity</p>
          <h1>{format(monthDate, "MMMM yyyy")}</h1>
        </div>
        <div className="month-actions">
          <MonthLink date={subMonths(monthDate, 1)} label="Previous month">
            ‹
          </MonthLink>
          <Link
            className="text-button"
            to={`/calendar/${format(new Date(), "yyyy-MM")}`}
          >
            Today
          </Link>
          <MonthLink date={addMonths(monthDate, 1)} label="Next month">
            ›
          </MonthLink>
        </div>
      </div>
      <div className="calendar-card">
        <div className="weekdays">
          {weekDays.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="calendar-grid">
          {calendarDays.map((day) => (
            <CalendarDayLink
              day={day}
              eventTypes={events.filter((event) =>
                event.date === format(day, "yyyy-MM-dd")
              ).map((event) => event.type)}
              key={day.toISOString()}
              month={monthDate}
            />
          ))}
        </div>
      </div>
      <p className="calendar-hint">
        Select a day to view or log completed activity.
      </p>
    </section>
  );
}

function MonthLink(
  { date, label, children }: { date: Date; label: string; children: string },
) {
  return (
    <Link
      aria-label={label}
      className="icon-button"
      to={`/calendar/${format(date, "yyyy-MM")}`}
    >
      {children}
    </Link>
  );
}
