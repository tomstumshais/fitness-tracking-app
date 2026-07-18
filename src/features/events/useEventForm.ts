import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type {
  EditableFitnessEvent,
  EditableFitnessEventInput,
} from "../../domain/fitness.ts";
import {
  type EventFormValues,
  eventToFormValues,
  formValuesToEvent,
  validateEventForm,
} from "./eventForm.ts";

interface FormOptions {
  date: string;
  event: EditableFitnessEvent | null;
  onSave: (input: EditableFitnessEventInput) => Promise<void>;
  type: "running" | "walking" | "cardio";
}

export function useEventForm(options: FormOptions) {
  const form = useForm<EventFormValues>({
    defaultValues: eventToFormValues(options.event),
  });

  useEffect(() => {
    form.reset(eventToFormValues(options.event));
  }, [form.reset, options.event, options.type]);

  const submit = form.handleSubmit(async (values) => {
    const result = validateEventForm(options.type, values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as keyof EventFormValues, {
          message: issue.message,
        });
      });
      return;
    }
    try {
      await options.onSave(
        formValuesToEvent(options.type, options.date, values),
      );
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error
          ? error.message
          : "Could not save event",
      });
    }
  });

  return { ...form, submit };
}
