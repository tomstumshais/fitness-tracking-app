import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { CustomExerciseInput, Exercise } from "../../domain/fitness.ts";
import { customExerciseSchema } from "./exerciseValidation.ts";

interface FormOptions {
  exercise: Exercise | null;
  onSave: (input: CustomExerciseInput) => Promise<void>;
  open: boolean;
}

export function useCustomExerciseForm(options: FormOptions) {
  const form = useForm<CustomExerciseInput>();

  useEffect(() => {
    if (!options.open) return;
    form.reset(
      options.exercise
        ? {
          name: options.exercise.name,
          equipment: options.exercise.equipment,
          muscleGroup: options.exercise.muscleGroup,
        }
        : { name: "", equipment: "dumbbell", muscleGroup: "legs" },
    );
  }, [form.reset, options.exercise, options.open]);

  const submit = form.handleSubmit(async (values) => {
    const result = customExerciseSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as keyof CustomExerciseInput, {
          message: issue.message,
        });
      });
      return;
    }
    try {
      await options.onSave(result.data);
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error
          ? error.message
          : "Could not save exercise",
      });
    }
  });

  return { ...form, submit };
}
