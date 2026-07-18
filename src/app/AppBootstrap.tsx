import { type ReactNode, useEffect } from "react";
import {
  loadExercises,
  selectExercisesStatus,
} from "../features/exercises/exercisesSlice.ts";
import { useAppDispatch, useAppSelector } from "./hooks.ts";

export function AppBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const exerciseStatus = useAppSelector(selectExercisesStatus);

  useEffect(() => {
    if (exerciseStatus === "idle") void dispatch(loadExercises());
  }, [dispatch, exerciseStatus]);

  return children;
}
