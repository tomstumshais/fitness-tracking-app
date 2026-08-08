import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import type {
  Exercise,
  WorkoutTemplateExercise,
} from "../../domain/fitness.ts";
import { selectAllExercises } from "../exercises/exercisesSlice.ts";
import {
  saveTemplate,
  selectTemplateById,
  selectTemplatesStatus,
} from "./templatesSlice.ts";

export function useTemplateEditor(templateId?: string) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const exercises = useAppSelector(selectAllExercises);
  const template = useAppSelector((state) =>
    templateId ? selectTemplateById(state, templateId) : undefined
  );
  const status = useAppSelector(selectTemplatesStatus);
  const [name, setName] = useState("");
  const [entries, setEntries] = useState<WorkoutTemplateExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(!templateId);

  useEffect(() => {
    if (!ready && template) {
      setName(template.name);
      setEntries(structuredClone(template.exercises));
      setReady(true);
    }
  }, [ready, template]);

  const addExercise = (exercise: Exercise) => {
    setEntries((current) => [...current, {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      equipment: exercise.equipment,
      setCount: 3,
    }]);
    setPickerOpen(false);
  };
  const setCount = (id: string, count: number) =>
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, setCount: count } : entry
      )
    );
  const remove = (id: string) =>
    setEntries((current) => current.filter((entry) => entry.id !== id));
  const move = (index: number, offset: -1 | 1) => {
    setEntries((current) => {
      const reordered = [...current];
      [reordered[index], reordered[index + offset]] = [
        reordered[index + offset],
        reordered[index],
      ];
      return reordered;
    });
  };
  const save = async () => {
    try {
      setSaving(true);
      setError("");
      await dispatch(saveTemplate({
        id: templateId,
        input: { name, exercises: entries },
      })).unwrap();
      navigate("/templates");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save");
      setSaving(false);
    }
  };

  return {
    addExercise,
    entries,
    error,
    exercises,
    move,
    name,
    pickerOpen,
    ready,
    remove,
    save,
    saving,
    setCount,
    setName,
    setPickerOpen,
    status,
    template,
  };
}
