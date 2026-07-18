import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ResistanceWorkoutDraft } from "../domain/fitness.ts";
import { resetDatabaseForTests } from "./database.ts";
import {
  createTemplateFromEvent,
  deleteWorkoutTemplate,
  listWorkoutTemplates,
  renameWorkoutTemplate,
} from "./templateRepository.ts";
import {
  completeWorkoutDraft,
  createDraftFromTemplate,
  createWorkoutDraft,
  saveWorkoutDraft,
} from "./workoutRepository.ts";

async function completedWorkout() {
  const created = await createWorkoutDraft("2026-07-17", "Lower body");
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
  return (await completeWorkoutDraft(created.id)).event;
}

describe("workout template repository", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(resetDatabaseForTests);

  it("creates a reusable template and starts an empty workout from it", async () => {
    const event = await completedWorkout();
    const template = await createTemplateFromEvent(
      event.id,
      "  Home   legs ",
    );
    expect(template).toEqual(expect.objectContaining({
      name: "Home legs",
      exercises: [expect.objectContaining({ setCount: 1 })],
    }));

    const draft = await createDraftFromTemplate("2026-07-18", template.id);
    expect(draft).toEqual(expect.objectContaining({
      date: "2026-07-18",
      name: "Home legs",
    }));
    expect(draft.exercises[0].sets[0]).toEqual(expect.objectContaining({
      weightKg: null,
      repetitions: 0,
      completed: false,
    }));

    const renamed = await renameWorkoutTemplate(template.id, "Leg day");
    expect((await listWorkoutTemplates())[0].name).toBe("Leg day");
    expect(renamed.updatedAt).toBeTruthy();
    await deleteWorkoutTemplate(template.id);
    expect(await listWorkoutTemplates()).toEqual([]);
  });
});
