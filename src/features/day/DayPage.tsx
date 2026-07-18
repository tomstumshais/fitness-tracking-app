import { format, isValid, parseISO } from "date-fns";
import { Navigate, useParams } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { EventFormDialog } from "../events/components/EventFormDialog.tsx";
import { EventList } from "../events/components/EventList.tsx";
import { EventTypePicker } from "../events/components/EventTypePicker.tsx";
import { ResistanceSetupDialog } from "../workouts/components/ResistanceSetupDialog.tsx";
import { DuplicateWorkoutDialog } from "../workouts/components/DuplicateWorkoutDialog.tsx";
import { WorkoutDraftList } from "../workouts/components/WorkoutDraftList.tsx";
import { TemplateNameDialog } from "../templates/components/TemplateNameDialog.tsx";
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
      <WorkoutDraftList drafts={day.drafts} />
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
          allEvents={day.allEvents}
          events={day.events}
          onDelete={day.remove}
          onDuplicate={day.setDuplicating}
          onEdit={day.editEvent}
          onEditResistance={(event) => void day.editResistanceEvent(event)}
          onSaveTemplate={day.setTemplateSource}
        />
      )}
      {day.pickerOpen && (
        <EventTypePicker
          onClose={() => day.setPickerOpen(false)}
          onResistance={day.openResistanceSetup}
          onSelect={day.openForm}
        />
      )}
      {day.resistanceSetupOpen && (
        <ResistanceSetupDialog
          onClose={() => day.setResistanceSetupOpen(false)}
          onStart={day.beginResistanceWorkout}
          onStartTemplate={day.beginTemplateWorkout}
          templates={day.templates}
        />
      )}
      {day.duplicating && (
        <DuplicateWorkoutDialog
          event={day.duplicating}
          onClose={() => day.setDuplicating(null)}
          onDuplicate={day.duplicateWorkout}
        />
      )}
      {day.templateSource && (
        <TemplateNameDialog
          defaultName={day.templateSource.name}
          eyebrow="Reuse this workout"
          onClose={() => day.setTemplateSource(null)}
          onSave={day.saveTemplate}
          submitLabel="Save template"
          title="Save as template"
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
