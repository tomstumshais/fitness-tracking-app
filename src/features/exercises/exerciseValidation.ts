import { z } from "zod";

export const customExerciseSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters").max(
    60,
    "Use 60 characters or fewer",
  ),
  equipment: z.enum(["dumbbell", "resistance-band", "bodyweight"]),
  muscleGroup: z.enum([
    "chest",
    "back",
    "shoulders",
    "arms",
    "legs",
    "glutes",
    "core",
    "full-body",
  ]),
});
