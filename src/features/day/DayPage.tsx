import { format, isValid, parseISO } from "date-fns";
import { Navigate, useParams } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { EventFormDialog } from "../events/components/EventFormDialog.tsx";
import { EventList } from "../events/components/EventList.tsx";
import { EventTypePicker } from "../events/components/EventTypePicker.tsx";
import { DayHeader } from "./DayHeader.tsx";
import { useDayEvents } from "./useDayEvents.ts";

export function DayPage() {
  const { date = "" } = useParams();
  const selectedDate = parseISO(date);
  const day = useDayEvents(date);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isValid(selectedDate)) {
    return (
      <Navigate to={`/calendar/${format(new Date(), "yyyy-MM")}`} replace />
    );
  }

  return (
    <section className="page day-page">
      <DayHeader date={selectedDate} onAdd={() => day.setPickerOpen(true)} />
      {day.status === "loading" && day.events.length === 0 && (
        <p className="loading-state">Loading events…</p>
      )}
      {day.status !== "loading" && day.events.length === 0 && (
        <EmptyState
          action={
            <button
              className="secondary-button"
              onClick={() => day.setPickerOpen(true)}
              type="button"
            >
              Log your first event
            </button>
          }
          description="Running, walking, cardio and resistance workouts will appear here."
          icon="＋"
          title="No activity logged"
        />
      )}
      {day.events.length > 0 && (
        <EventList
          events={day.events}
          onDelete={day.remove}
          onEdit={day.editEvent}
        />
      )}
      {day.pickerOpen && (
        <EventTypePicker
          onClose={() => day.setPickerOpen(false)}
          onSelect={day.openForm}
        />
      )}
      {day.formType && (
        <EventFormDialog
          activityName={day.activityName}
          date={date}
          event={day.editing}
          onClose={day.closeForm}
          onSave={day.save}
          type={day.formType}
        />
      )}
    </section>
  );
}
