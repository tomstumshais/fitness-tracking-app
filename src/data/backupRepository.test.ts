import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createFitnessBackup,
  restoreFitnessBackup,
} from "./backupRepository.ts";
import { getDatabase, resetDatabaseForTests } from "./database.ts";
import { createFitnessEvent, listFitnessEvents } from "./eventRepository.ts";
import { createCustomExercise, listExercises } from "./exerciseRepository.ts";
import { createWorkoutDraft, listWorkoutDrafts } from "./workoutRepository.ts";

describe("fitness backup repository", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(resetDatabaseForTests);

  it("exports and atomically restores all user-created data", async () => {
    const custom = await createCustomExercise({
      name: "Floor Fly",
      equipment: "dumbbell",
      muscleGroup: "chest",
    });
    const event = await createFitnessEvent({
      type: "running",
      date: "2026-07-18",
      durationMinutes: 30,
      distanceKm: 5,
    });
    const draft = await createWorkoutDraft("2026-07-19", "Sunday legs");
    const database = await getDatabase();
    await database.put("settings", { key: "example", value: true });
    const backup = await createFitnessBackup();

    await createCustomExercise({
      name: "Replacement exercise",
      equipment: "bodyweight",
      muscleGroup: "core",
    });
    await createFitnessEvent({
      type: "walking",
      date: "2026-07-20",
      durationMinutes: 20,
      distanceKm: 1.5,
    });
    await createWorkoutDraft("2026-07-20", "Replacement draft");
    await database.put("settings", { key: "example", value: false });

    await restoreFitnessBackup(backup);

    const exercises = await listExercises();
    expect(exercises.filter((item) => item.source === "custom")).toEqual([
      custom,
    ]);
    expect(exercises).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "Push-Up", source: "predefined" }),
    ]));
    expect(await listFitnessEvents()).toEqual([event]);
    expect(await listWorkoutDrafts()).toEqual([draft]);
    expect(await database.get("settings", "example")).toEqual({
      key: "example",
      value: true,
    });
  });

  it("rejects an invalid backup before changing current data", async () => {
    const event = await createFitnessEvent({
      type: "walking",
      date: "2026-07-18",
      durationMinutes: 40,
      distanceKm: 3,
    });

    await expect(restoreFitnessBackup({ version: 99 })).rejects.toThrow(
      "not a valid Fitness Log backup",
    );
    expect(await listFitnessEvents()).toEqual([event]);
  });
});
