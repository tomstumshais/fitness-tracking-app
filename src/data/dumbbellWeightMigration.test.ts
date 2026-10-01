import { describe, expect, it } from "vitest";
import type { ResistanceWorkoutDraft } from "../domain/fitness.ts";
import { addDumbbellGripWeight } from "./dumbbellWeightMigration.ts";

describe("dumbbell weight migration", () => {
  it("adds grip weight only to numeric dumbbell sets", () => {
    const draft: ResistanceWorkoutDraft = {
      id: "draft:test",
      date: "2026-09-30",
      name: "Upper body",
      exercises: [
        {
          id: "entry:dumbbell",
          exerciseId: "dumbbell-press",
          exerciseName: "Dumbbell Press",
          equipment: "dumbbell",
          sets: [
            { id: "set:1", weightKg: 20, repetitions: 10, completed: true },
            { id: "set:2", weightKg: null, repetitions: 0, completed: false },
          ],
        },
        {
          id: "entry:band",
          exerciseId: "band-row",
          exerciseName: "Band Row",
          equipment: "resistance-band",
          sets: [
            { id: "set:3", weightKg: 5, repetitions: 12, completed: true },
          ],
        },
      ],
      createdAt: "2026-09-30T08:00:00.000Z",
      updatedAt: "2026-09-30T08:00:00.000Z",
    };

    const migrated = addDumbbellGripWeight(
      draft,
      "2026-10-01T08:00:00.000Z",
    );

    expect(migrated.exercises[0].sets.map((set) => set.weightKg)).toEqual([
      21,
      null,
    ]);
    expect(migrated.exercises[1].sets[0].weightKg).toBe(5);
    expect(migrated.updatedAt).toBe("2026-10-01T08:00:00.000Z");
    expect(draft.exercises[0].sets[0].weightKg).toBe(20);
  });
});
