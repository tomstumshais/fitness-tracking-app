import type { MuscleGroup } from "../../domain/fitness.ts";

export const muscleGroupOptions: { value: MuscleGroup; label: string }[] = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "glutes", label: "Glutes" },
  { value: "core", label: "Core" },
  { value: "full-body", label: "Full body" },
];

export function muscleGroupLabel(value: MuscleGroup) {
  return muscleGroupOptions.find((option) => option.value === value)?.label ??
    value;
}
