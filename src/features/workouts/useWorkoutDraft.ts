import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import type {
  Exercise,
  ResistanceSet,
  ResistanceWorkoutDraft,
} from "../../domain/fitness.ts";
import { selectAllEvents } from "../events/eventsSlice.ts";
import { selectAllExercises } from "../exercises/exercisesSlice.ts";
import { findPreviousExercise } from "./resistanceProgress.ts";
import {
  discardWorkout,
  draftUpdated,
  finishWorkout,
  persistWorkout,
  selectWorkoutById,
  selectWorkoutsStatus,
} from "./workoutsSlice.ts";

function newSet(weightKg: number | null, repetitions = 0): ResistanceSet {
  return { id: crypto.randomUUID(), weightKg, repetitions, completed: false };
}

export function useWorkoutDraft(id: string) {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((state) => selectWorkoutById(state, id));
  const status = useAppSelector(selectWorkoutsStatus);
  const events = useAppSelector(selectAllEvents);
  const exercises = useAppSelector(selectAllExercises);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const commit = (next: ResistanceWorkoutDraft) => {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    draftRef.current = updated;
    dispatch(draftUpdated(updated));
    return dispatch(persistWorkout(updated));
  };
  const addExercise = (exercise: Exercise) => {
    const current = draftRef.current;
    if (!current) return;
    const previous = findPreviousExercise(events, current, exercise.id);
    const sets = previous?.sets.length
      ? previous.sets.map((set) => newSet(set.weightKg, set.repetitions))
      : [newSet(null)];
    void commit({
      ...current,
      exercises: [...current.exercises, {
        id: crypto.randomUUID(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        equipment: exercise.equipment,
        sets,
      }],
    });
  };
  const removeExercise = (entryId: string) => {
    const current = draftRef.current;
    if (current) {
      void commit({
        ...current,
        exercises: current.exercises.filter((entry) => entry.id !== entryId),
      });
    }
  };
  const changeSets = (entryId: string, sets: ResistanceSet[]) => {
    const current = draftRef.current;
    if (current) {
      void commit({
        ...current,
        exercises: current.exercises.map((entry) =>
          entry.id === entryId ? { ...entry, sets } : entry
        ),
      });
    }
  };
  const changeNotes = (entryId: string, notes: string) => {
    const current = draftRef.current;
    if (current) {
      void commit({
        ...current,
        exercises: current.exercises.map((entry) =>
          entry.id === entryId ? { ...entry, notes: notes || undefined } : entry
        ),
      });
    }
  };
  const finish = () => dispatch(finishWorkout(id)).unwrap();
  const discard = () => dispatch(discardWorkout(id)).unwrap();
  const rename = async (name: string) => {
    const current = draftRef.current;
    if (!current) throw new Error("Workout draft not found");
    try {
      await commit({ ...current, name }).unwrap();
    } catch (error) {
      draftRef.current = current;
      dispatch(draftUpdated(current));
      throw error;
    }
  };

  return {
    addExercise,
    changeNotes,
    changeSets,
    discard,
    draft,
    events,
    exercises,
    finish,
    rename,
    removeExercise,
    status,
  };
}
