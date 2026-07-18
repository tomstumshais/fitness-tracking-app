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
    legacy.close();

    const upgraded = await getDatabase();
    expect(upgraded.version).toBe(2);
    expect(upgraded.objectStoreNames.contains("workoutTemplates")).toBe(true);
    const drafts = upgraded.transaction("workoutDrafts").store;
    expect(drafts.indexNames.contains("by-source-event")).toBe(true);
    expect(drafts.index("by-source-event").unique).toBe(true);
    expect(await upgraded.get("settings", "legacy")).toEqual({
      key: "legacy",
      value: true,
    });
  });
});
