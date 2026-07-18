import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createFitnessBackup,
  readFitnessBackup,
  restoreFitnessBackup,
} from "./backupRepository.ts";
import { getDatabase, resetDatabaseForTests } from "./database.ts";
import { createFitnessEvent, listFitnessEvents } from "./eventRepository.ts";
import { createCustomExercise, listExercises } from "./exerciseRepository.ts";
import { listWorkoutTemplates } from "./templateRepository.ts";
import { createWorkoutDraft, listWorkoutDrafts } from "./workoutRepository.ts";
import type { WorkoutTemplate } from "../domain/fitness.ts";

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
    const timestamp = new Date().toISOString();
    const template: WorkoutTemplate = {
      id: "template:backup-test",
      name: "Home legs",
      exercises: [{
        id: "template-exercise:backup-test",
        exerciseId: "dumbbell-goblet-squat",
        exerciseName: "Dumbbell Goblet Squat",
        equipment: "dumbbell",
        setCount: 3,
      }],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await database.put("workoutTemplates", template);
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
    await database.clear("workoutTemplates");
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
    expect(await listWorkoutTemplates()).toEqual([template]);
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

  it("migrates version 1 backups to the current format", async () => {
    await createWorkoutDraft("2026-07-19", "Legacy draft");
    const current = await createFitnessBackup();
    const { workoutTemplates: _templates, ...legacyData } = current.data;

    const migrated = readFitnessBackup({
      ...current,
      version: 1,
      data: legacyData,
    });

    expect(migrated.version).toBe(2);
    expect(migrated.data.workoutTemplates).toEqual([]);
    expect(migrated.data.workoutDrafts).toHaveLength(1);
  });

  it("renames legacy cycling activities when restoring a backup", async () => {
    const backup = await createFitnessBackup();
    backup.data.fitnessEvents.push({
      id: "event:legacy-cycling-backup",
      date: "2026-07-18",
      type: "cardio",
      name: "Outdoor bicycle",
      durationMinutes: 45,
      intensity: "moderate",
      createdAt: "2026-07-18T10:00:00.000Z",
      updatedAt: "2026-07-18T10:00:00.000Z",
    });

    await restoreFitnessBackup(backup);

    expect(await listFitnessEvents()).toEqual([
      expect.objectContaining({ name: "Outdoor cycling" }),
    ]);
  });
});
