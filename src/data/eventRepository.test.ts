import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetDatabaseForTests } from "./database.ts";
import {
  createFitnessEvent,
  deleteFitnessEvent,
  listEventsByDate,
  listFitnessEvents,
  updateFitnessEvent,
} from "./eventRepository.ts";

describe("fitness event repository", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(resetDatabaseForTests);

  it("creates, updates, filters and deletes distance events", async () => {
    const created = await createFitnessEvent({
      type: "running",
      date: "2026-07-18",
      durationMinutes: 32,
      distanceKm: 5,
      notes: "  Evening   run  ",
    });
    await createFitnessEvent({
      type: "walking",
      date: "2026-07-19",
      durationMinutes: 45,
      distanceKm: 3.5,
    });

    expect(await listEventsByDate("2026-07-18")).toEqual([
      expect.objectContaining({ id: created.id, notes: "Evening run" }),
    ]);

    const updated = await updateFitnessEvent(created.id, {
      type: "running",
      date: "2026-07-18",
      durationMinutes: 30,
      distanceKm: 5,
      notes: "Felt strong",
    });
    expect(updated).toEqual(expect.objectContaining({
      id: created.id,
      durationMinutes: 30,
      notes: "Felt strong",
    }));

    await deleteFitnessEvent(created.id);
    expect(await listFitnessEvents()).toHaveLength(1);
  });

  it("normalizes cardio activity names", async () => {
    const cardio = await createFitnessEvent({
      type: "cardio",
      date: "2026-07-18",
      name: "  Dumbbell   circuit ",
      durationMinutes: 20,
      intensity: "high",
    });

    if (cardio.type !== "cardio") throw new Error("Expected a cardio event");
    expect(cardio.name).toBe("Dumbbell circuit");

    const cycling = await createFitnessEvent({
      type: "cardio",
      date: "2026-07-19",
      name: "Outdoor bicycle",
      durationMinutes: 40,
      intensity: "moderate",
    });
    if (cycling.type !== "cardio") throw new Error("Expected a cardio event");
    expect(cycling.name).toBe("Outdoor cycling");
  });
});
