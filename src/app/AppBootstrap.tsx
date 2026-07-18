import { type ReactNode, useEffect } from "react";
import {
  loadTemplates,
  selectTemplatesStatus,
} from "../features/templates/templatesSlice.ts";
import {
  loadEvents,
  selectEventsStatus,
} from "../features/events/eventsSlice.ts";
import {
  loadExercises,
  selectExercisesStatus,
} from "../features/exercises/exercisesSlice.ts";
import {
  loadWorkoutDrafts,
  selectWorkoutsStatus,
} from "../features/workouts/workoutsSlice.ts";
import { useAppDispatch, useAppSelector } from "./hooks.ts";

export function AppBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const eventStatus = useAppSelector(selectEventsStatus);
  const exerciseStatus = useAppSelector(selectExercisesStatus);
  const templateStatus = useAppSelector(selectTemplatesStatus);
  const workoutStatus = useAppSelector(selectWorkoutsStatus);

  useEffect(() => {
    if (eventStatus === "idle") void dispatch(loadEvents());
    if (exerciseStatus === "idle") void dispatch(loadExercises());
    if (templateStatus === "idle") void dispatch(loadTemplates());
    if (workoutStatus === "idle") void dispatch(loadWorkoutDrafts());
  }, [dispatch, eventStatus, exerciseStatus, templateStatus, workoutStatus]);

  return children;
}
