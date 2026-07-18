import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import type {
  EditableFitnessEvent,
  EditableFitnessEventInput,
  FitnessEvent,
} from "../../domain/fitness.ts";
import {
  deleteEvent,
  saveEvent,
  selectAllEvents,
  selectEventsStatus,
} from "../events/eventsSlice.ts";
import {
  selectAllWorkoutDrafts,
  startWorkout,
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
    closeForm,
    drafts,
    editing,
    editEvent,
    events,
    formType,
    openForm,
    openResistanceSetup,
    pickerOpen,
    remove,
    resistanceSetupOpen,
    save,
    setPickerOpen,
    setResistanceSetupOpen,
    status,
  };
}
