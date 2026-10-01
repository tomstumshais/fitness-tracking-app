import { openDB } from "idb";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getDatabase, resetDatabaseForTests } from "./database.ts";

describe("database migrations", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(resetDatabaseForTests);

  it("upgrades version 1 data without replacing existing records", async () => {
    const legacy = await openDB("fitness-log", 1, {
      upgrade(database) {
        const exercises = database.createObjectStore("exercises", {
          keyPath: "id",
        });
        exercises.createIndex("by-equipment", "equipment");
        exercises.createIndex("by-source", "source");
        const events = database.createObjectStore("fitnessEvents", {
          keyPath: "id",
        });
        events.createIndex("by-date", "date");
        events.createIndex("by-type", "type");
        const drafts = database.createObjectStore("workoutDrafts", {
          keyPath: "id",
        });
        drafts.createIndex("by-date", "date");
        database.createObjectStore("settings", { keyPath: "key" });
      },
    });
    await legacy.put("settings", { key: "legacy", value: true });
    await legacy.put("fitnessEvents", {
      id: "event:legacy-cycling",
      date: "2026-07-18",
      type: "cardio",
      name: "Indoor spin bike",
      durationMinutes: 30,
      intensity: "moderate",
      createdAt: "2026-07-18T10:00:00.000Z",
      updatedAt: "2026-07-18T10:00:00.000Z",
    });
    await legacy.put("fitnessEvents", {
      id: "event:legacy-resistance",
      date: "2026-09-11",
      type: "resistance",
      name: "Upper body",
      exercises: [{
        id: "entry:dumbbell",
        exerciseId: "dumbbell-bench-press",
        exerciseName: "Dumbbell Bench Press",
        equipment: "dumbbell",
        sets: [{
          id: "set:event",
          weightKg: 20,
          repetitions: 10,
          completed: true,
        }],
      }],
      createdAt: "2026-09-11T10:00:00.000Z",
      updatedAt: "2026-09-11T10:00:00.000Z",
    });
    await legacy.put("workoutDrafts", {
      id: "draft:legacy-resistance",
      date: "2026-07-20",
      name: "Lower body",
      exercises: [{
        id: "entry:dumbbell",
        exerciseId: "dumbbell-romanian-deadlift",
        exerciseName: "Dumbbell Romanian Deadlift",
        equipment: "dumbbell",
        sets: [{
          id: "set:draft",
          weightKg: 24,
          repetitions: 8,
          completed: false,
        }],
      }],
      createdAt: "2026-07-20T10:00:00.000Z",
      updatedAt: "2026-07-20T10:00:00.000Z",
    });
    legacy.close();

    const upgraded = await getDatabase();
    expect(upgraded.version).toBe(6);
    expect(upgraded.objectStoreNames.contains("workoutTemplates")).toBe(true);
    const drafts = upgraded.transaction("workoutDrafts").store;
    expect(drafts.indexNames.contains("by-source-event")).toBe(true);
    expect(drafts.index("by-source-event").unique).toBe(true);
    expect(await upgraded.get("settings", "legacy")).toEqual({
      key: "legacy",
      value: true,
    });
    expect(await upgraded.get("fitnessEvents", "event:legacy-cycling"))
      .toEqual(expect.objectContaining({ name: "Indoor cycling" }));
    const event = await upgraded.get(
      "fitnessEvents",
      "event:legacy-resistance",
    );
    const draft = await upgraded.get(
      "workoutDrafts",
      "draft:legacy-resistance",
    );
    expect(
      event?.type === "resistance" &&
        event.exercises[0].sets[0].weightKg,
    ).toBe(22);
    expect(draft?.exercises[0].sets[0].weightKg).toBe(25);
    expect(
      await upgraded.get("settings", "migration:5:dumbbell-grip-weight"),
    ).toEqual({ key: "migration:5:dumbbell-grip-weight", value: true });
    expect(
      await upgraded.get(
        "settings",
        "migration:6:2026-09-11-dumbbell-weight",
      ),
    ).toEqual({
      key: "migration:6:2026-09-11-dumbbell-weight",
      value: true,
    });
  });
});
