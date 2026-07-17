import { format, isValid, parseISO } from "date-fns";
import { Link, Navigate, useParams } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState.tsx";

export function DayPage() {
  const { date = "" } = useParams();
  const selectedDate = parseISO(date);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isValid(selectedDate)) {
    return (
      <Navigate to={`/calendar/${format(new Date(), "yyyy-MM")}`} replace />
    );
  }

  return (
    <section className="page day-page">
      <Link
        className="back-link"
        to={`/calendar/${format(selectedDate, "yyyy-MM")}`}
      >
        ← Calendar
      </Link>
      <div className="day-heading">
        <div>
          <p className="eyebrow">{format(selectedDate, "EEEE")}</p>
          <h1>{format(selectedDate, "d MMMM yyyy")}</h1>
        </div>
        <button className="primary-button" type="button">+ Add event</button>
      </div>
      <EmptyState
        action={
          <button className="secondary-button" type="button">
            Log your first event
          </button>
        }
        description="Running, walking, cardio and resistance workouts will appear here."
        icon="＋"
        title="No activity logged"
      />
    </section>
  );
}
