import { type ReactNode, useEffect } from "react";
import {
  loadEvents,
  selectEventsStatus,
} from "../features/events/eventsSlice.ts";
import {
  loadExercises,
  selectExercisesStatus,
} from "../features/exercises/exercisesSlice.ts";
import { useAppDispatch, useAppSelector } from "./hooks.ts";

export function AppBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const eventStatus = useAppSelector(selectEventsStatus);
  const exerciseStatus = useAppSelector(selectExercisesStatus);

  useEffect(() => {
    if (eventStatus === "idle") void dispatch(loadEvents());
    if (exerciseStatus === "idle") void dispatch(loadExercises());
  }, [dispatch, eventStatus, exerciseStatus]);

  return children;
}
