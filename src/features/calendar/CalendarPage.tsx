import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Link, Navigate, useParams } from "react-router-dom";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarPage() {
  const { month = "" } = useParams();
  const monthDate = parseISO(`${month}-01`);

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
            <Link
              aria-label={format(day, "EEEE, d MMMM yyyy")}
              className={`calendar-day${
                isSameMonth(day, monthDate) ? "" : " muted"
              }${isSameDay(day, new Date()) ? " today" : ""}`}
              key={day.toISOString()}
              to={`/day/${format(day, "yyyy-MM-dd")}`}
            >
              <span>{format(day, "d")}</span>
            </Link>
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
