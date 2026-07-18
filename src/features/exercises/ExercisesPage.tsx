import { useState } from "react";
import type { CustomExerciseInput, Exercise } from "../../domain/fitness.ts";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import { CustomExerciseDialog } from "./components/CustomExerciseDialog.tsx";
import { ExercisePageHeader } from "./components/ExercisePageHeader.tsx";
import {
  type ExerciseFilter,
  ExerciseFilters,
} from "./components/ExerciseFilters.tsx";
import { ExerciseList } from "./components/ExerciseList.tsx";
import {
  deleteCustomExercise,
  saveCustomExercise,
  selectAllExercises,
  selectExercisesError,
  selectExercisesStatus,
} from "./exercisesSlice.ts";

export function ExercisesPage() {
  const dispatch = useAppDispatch();
  const exercises = useAppSelector(selectAllExercises);
  const status = useAppSelector(selectExercisesStatus);
  const error = useAppSelector(selectExercisesError);
  const [filter, setFilter] = useState<ExerciseFilter>("all");
  const [search, setSearch] = useState("");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLocaleLowerCase().includes(
      normalizedSearch,
    );
    const matchesFilter = filter === "all" ||
      (filter === "custom"
        ? exercise.source === "custom"
        : exercise.equipment === filter);
    return matchesSearch && matchesFilter;
  });

  const openDialog = (exercise: Exercise | null) => {
    setEditingExercise(exercise);
    setDialogOpen(true);
  };

  const saveExercise = async (input: CustomExerciseInput) => {
    await dispatch(saveCustomExercise({ id: editingExercise?.id, input }))
      .unwrap();
    setDialogOpen(false);
  };

  const deleteExercise = async (exercise: Exercise) => {
    if (
      !globalThis.confirm(
        `Delete “${exercise.name}”? Existing workout history will keep its name.`,
      )
    ) return;
    await dispatch(deleteCustomExercise(exercise.id)).unwrap();
  };

  return (
    <section className="page exercises-page">
      <ExercisePageHeader onAdd={() => openDialog(null)} />
      <ExerciseFilters
        filter={filter}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        search={search}
      />
      <div className="exercise-result-row">
        <span>
          {status === "loading"
            ? "Loading exercises…"
            : `${visibleExercises.length} ${
              visibleExercises.length === 1 ? "exercise" : "exercises"
            }`}
        </span>
        {error && <span className="field-error">{error}</span>}
      </div>
      <ExerciseList
        exercises={visibleExercises}
        onDelete={deleteExercise}
        onEdit={(exercise) => openDialog(exercise)}
      />
      <CustomExerciseDialog
        exercise={editingExercise}
        onClose={() => setDialogOpen(false)}
        onSave={saveExercise}
        open={dialogOpen}
      />
    </section>
  );
}
