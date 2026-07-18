import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetDatabaseForTests } from "./database.ts";
import {
  createCustomExercise,
  deleteCustomExercise,
  ExerciseNameExistsError,
  listExercises,
  updateCustomExercise,
} from "./exerciseRepository.ts";

describe("exercise repository", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(resetDatabaseForTests);

  it("seeds only predefined dumbbell and bodyweight exercises", async () => {
    const exercises = await listExercises();

    expect(exercises.length).toBeGreaterThan(40);
    expect(exercises).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: "Dumbbell Romanian Deadlift",
        equipment: "dumbbell",
      }),
      expect.objectContaining({
        name: "Dumbbell Bench Press",
        equipment: "dumbbell",
      }),
      expect.objectContaining({ name: "Push-Up", equipment: "bodyweight" }),
    ]));
    expect(
      exercises.every((item) =>
        ["dumbbell", "bodyweight"].includes(item.equipment)
      ),
    ).toBe(true);
  });

  it("creates, updates and deletes a custom exercise", async () => {
    const created = await createCustomExercise({
      name: "  Dumbbell   Sumo Squat  ",
      equipment: "dumbbell",
      muscleGroup: "legs",
    });
    expect(created.name).toBe("Dumbbell Sumo Squat");

    const updated = await updateCustomExercise(created.id, {
      name: "Dumbbell Sumo Deadlift",
      equipment: "dumbbell",
      muscleGroup: "glutes",
    });
    expect(updated.id).toBe(created.id);
    expect(updated.muscleGroup).toBe("glutes");

    await deleteCustomExercise(created.id);
    expect(await listExercises()).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: created.id }),
    ]));
  });

  it("prevents duplicate exercise names regardless of casing", async () => {
    await expect(createCustomExercise({
      name: "push-up",
      equipment: "bodyweight",
      muscleGroup: "chest",
    })).rejects.toBeInstanceOf(ExerciseNameExistsError);
  });
});
