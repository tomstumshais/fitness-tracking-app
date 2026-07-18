import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import type {
  EditableFitnessEvent,
  EditableFitnessEventInput,
  FitnessEvent,
  ResistanceEvent,
} from "../../domain/fitness.ts";
import {
  deleteEvent,
  saveEvent,
  selectAllEvents,
  selectEventsStatus,
} from "../events/eventsSlice.ts";
import {
  saveWorkoutAsTemplate,
  selectAllTemplates,
} from "../templates/templatesSlice.ts";
import {
  duplicateResistanceWorkout,
  editResistanceWorkout,
  selectAllWorkoutDrafts,
  startWorkout,
  startWorkoutFromTemplate,
} from "../workouts/workoutsSlice.ts";

type LoggableType = "running" | "walking" | "cardio";

export function useDayEvents(date: string) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const allEvents = useAppSelector(selectAllEvents);
  const events = allEvents.filter((event) => event.date === date);
  const status = useAppSelector(selectEventsStatus);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formType, setFormType] = useState<LoggableType | null>(null);
  const [editing, setEditing] = useState<EditableFitnessEvent | null>(null);
  const [activityName, setActivityName] = useState<string>();
  const [resistanceSetupOpen, setResistanceSetupOpen] = useState(false);
  const [duplicating, setDuplicating] = useState<ResistanceEvent | null>(null);
  const [templateSource, setTemplateSource] = useState<ResistanceEvent | null>(
    null,
  );
  const templates = useAppSelector(selectAllTemplates);
  const drafts = useAppSelector(selectAllWorkoutDrafts).filter((draft) =>
    draft.date === date
  );

  const openForm = (type: LoggableType, selectedActivity?: string) => {
    setPickerOpen(false);
    setEditing(null);
    setActivityName(selectedActivity);
    setFormType(type);
  };
  const editEvent = (event: EditableFitnessEvent) => {
    setEditing(event);
    setActivityName(event.type === "cardio" ? event.name : undefined);
    setFormType(event.type);
  };
  const closeForm = () => {
    setFormType(null);
    setEditing(null);
    setActivityName(undefined);
  };
  const openResistanceSetup = () => {
    setPickerOpen(false);
    setResistanceSetupOpen(true);
  };
  const beginResistanceWorkout = async (name: string) => {
    const draft = await dispatch(startWorkout({ date, name })).unwrap();
    setResistanceSetupOpen(false);
    navigate(`/workout/${draft.id}`);
  };
  const beginTemplateWorkout = async (templateId: string) => {
    const draft = await dispatch(
      startWorkoutFromTemplate({ date, templateId }),
    ).unwrap();
    setResistanceSetupOpen(false);
    navigate(`/workout/${draft.id}`);
  };
  const editResistanceEvent = async (event: ResistanceEvent) => {
    const draft = await dispatch(editResistanceWorkout(event.id)).unwrap();
    navigate(`/workout/${draft.id}`);
  };
  const duplicateWorkout = async (targetDate: string, name: string) => {
    if (!duplicating) return;
    const draft = await dispatch(duplicateResistanceWorkout({
      eventId: duplicating.id,
      date: targetDate,
      name,
    })).unwrap();
    setDuplicating(null);
    navigate(`/workout/${draft.id}`);
  };
  const saveTemplate = async (name: string) => {
    if (!templateSource) return;
    await dispatch(saveWorkoutAsTemplate({
      eventId: templateSource.id,
      name,
    })).unwrap();
    setTemplateSource(null);
  };
  const save = async (input: EditableFitnessEventInput) => {
    await dispatch(saveEvent({ id: editing?.id, input })).unwrap();
    closeForm();
  };
  const remove = async (event: FitnessEvent) => {
    if (globalThis.confirm(`Delete ${event.type} event?`)) {
      await dispatch(deleteEvent(event.id)).unwrap();
    }
  };

  return {
    activityName,
    allEvents,
    beginResistanceWorkout,
    beginTemplateWorkout,
    closeForm,
    drafts,
    duplicateWorkout,
    duplicating,
    editing,
    editEvent,
    editResistanceEvent,
    events,
    formType,
    openForm,
    openResistanceSetup,
    pickerOpen,
    remove,
    resistanceSetupOpen,
    save,
    saveTemplate,
    setPickerOpen,
    setResistanceSetupOpen,
    setDuplicating,
    setTemplateSource,
    status,
    templateSource,
    templates,
  };
}
