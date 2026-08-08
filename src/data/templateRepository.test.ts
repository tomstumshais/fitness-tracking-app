import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ResistanceWorkoutDraft } from "../domain/fitness.ts";
import { resetDatabaseForTests } from "./database.ts";
import {
  createTemplateFromEvent,
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  listWorkoutTemplates,
  renameWorkoutTemplate,
  updateWorkoutTemplate,
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

  it("creates and edits a template before it is used", async () => {
    const template = await createWorkoutTemplate({
      name: "  Upper   body ",
      exercises: [{
        id: "template-exercise-1",
        exerciseId: "predefined:dumbbell-bench-press",
        exerciseName: "Dumbbell Bench Press",
        equipment: "dumbbell",
        setCount: 3,
      }],
    });
    const updated = await updateWorkoutTemplate(template.id, {
      name: "Push day",
      exercises: [{ ...template.exercises[0], setCount: 4 }],
    });

    expect(updated).toEqual(expect.objectContaining({
      name: "Push day",
      exercises: [expect.objectContaining({
        id: "template-exercise-1",
        setCount: 4,
      })],
    }));
    const draft = await createDraftFromTemplate("2026-07-19", template.id);
    expect(draft.exercises[0].sets).toHaveLength(4);
  });
});
