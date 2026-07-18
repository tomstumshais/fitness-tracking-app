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
    legacy.close();

    const upgraded = await getDatabase();
    expect(upgraded.version).toBe(3);
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
  });
});
