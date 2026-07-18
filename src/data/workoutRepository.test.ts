import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ResistanceWorkoutDraft } from "../domain/fitness.ts";
import { resetDatabaseForTests } from "./database.ts";
import { listFitnessEvents } from "./eventRepository.ts";
import {
  completeWorkoutDraft,
  createWorkoutDraft,
  listWorkoutDrafts,
  saveWorkoutDraft,
} from "./workoutRepository.ts";

describe("resistance workout repository", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(resetDatabaseForTests);

  it("persists a draft and atomically completes it as an event", async () => {
    const created = await createWorkoutDraft("2026-07-18", " Upper  body ");
    const draft: ResistanceWorkoutDraft = {
      ...created,
      exercises: [{
        id: "entry-1",
        exerciseId: "dumbbell-romanian-deadlift",
        exerciseName: "Dumbbell Romanian Deadlift",
        equipment: "dumbbell",
        sets: [{
          id: "set-1",
          weightKg: 22.5,
          repetitions: 8,
          completed: true,
        }],
      }],
    };
    await saveWorkoutDraft(draft);
    expect(await listWorkoutDrafts()).toEqual([
      expect.objectContaining({ id: created.id, name: "Upper body" }),
    ]);

    const result = await completeWorkoutDraft(created.id);
    expect(result.event).toEqual(expect.objectContaining({
      type: "resistance",
      name: "Upper body",
    }));
    expect(await listWorkoutDrafts()).toHaveLength(0);
    expect(await listFitnessEvents()).toEqual([
      expect.objectContaining({ id: result.event.id, type: "resistance" }),
    ]);
  });

  it("does not complete invalid or unfinished sets", async () => {
    const created = await createWorkoutDraft("2026-07-18", "Legs");
    await expect(completeWorkoutDraft(created.id)).rejects.toThrow(
      "Complete every set",
    );
    expect(await listWorkoutDrafts()).toHaveLength(1);
  });
});
