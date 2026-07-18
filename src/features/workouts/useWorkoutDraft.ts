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

  const commit = (next: ResistanceWorkoutDraft) => {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    dispatch(draftUpdated(updated));
    void dispatch(persistWorkout(updated));
  };
  const addExercise = (exercise: Exercise) => {
    if (!draft) return;
    const previous = findPreviousExercise(events, draft, exercise.id);
    const sets = previous?.sets.length
      ? previous.sets.map((set) => newSet(set.weightKg, set.repetitions))
      : [newSet(null)];
    commit({
      ...draft,
      exercises: [...draft.exercises, {
        id: crypto.randomUUID(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        equipment: exercise.equipment,
        sets,
      }],
    });
  };
  const removeExercise = (entryId: string) => {
    if (draft) {
      commit({
        ...draft,
        exercises: draft.exercises.filter((entry) => entry.id !== entryId),
      });
    }
  };
  const changeSets = (entryId: string, sets: ResistanceSet[]) => {
    if (draft) {
      commit({
        ...draft,
        exercises: draft.exercises.map((entry) =>
          entry.id === entryId ? { ...entry, sets } : entry
        ),
      });
    }
  };
  const finish = () => dispatch(finishWorkout(id)).unwrap();
  const discard = () => dispatch(discardWorkout(id)).unwrap();

  return {
    addExercise,
    changeSets,
    discard,
    draft,
    events,
    exercises,
    finish,
    removeExercise,
    status,
  };
}
