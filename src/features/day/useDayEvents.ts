import { useState } from "react";
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

type LoggableType = "running" | "walking" | "cardio";

export function useDayEvents(date: string) {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectAllEvents).filter((event) =>
    event.date === date
  );
  const status = useAppSelector(selectEventsStatus);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formType, setFormType] = useState<LoggableType | null>(null);
  const [editing, setEditing] = useState<EditableFitnessEvent | null>(null);

  const openForm = (type: LoggableType) => {
    setPickerOpen(false);
    setEditing(null);
    setFormType(type);
  };
  const editEvent = (event: EditableFitnessEvent) => {
    setEditing(event);
    setFormType(event.type);
  };
  const closeForm = () => {
    setFormType(null);
    setEditing(null);
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
    closeForm,
    editing,
    editEvent,
    events,
    formType,
    openForm,
    pickerOpen,
    remove,
    save,
    setPickerOpen,
    status,
  };
}
