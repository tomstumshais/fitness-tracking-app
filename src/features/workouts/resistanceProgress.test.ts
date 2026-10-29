import { describe, expect, it } from "vitest";
import type {
  Equipment,
  ResistanceEvent,
  ResistanceExerciseEntry,
  ResistanceWorkoutDraft,
} from "../../domain/fitness.ts";
import {
  findPreviousExercise,
  formatPreviousSet,
  getProgressSummary,
  isWorkoutReady,
} from "./resistanceProgress.ts";

const previousEntry: ResistanceExerciseEntry = {
  id: "old-entry",
  exerciseId: "squat",
  exerciseName: "Dumbbell Squat",
  equipment: "dumbbell",
  sets: [{ id: "old-set", weightKg: 20, repetitions: 10, completed: true }],
};
const previousEvent: ResistanceEvent = {
  id: "old-workout",
  date: "2026-07-17",
  type: "resistance",
  name: "Legs",
  exercises: [previousEntry],
  createdAt: "2026-07-17T10:00:00.000Z",
  updatedAt: "2026-07-17T10:00:00.000Z",
};

function exerciseWithSets(
  repetitions: number[],
  weightKg: number | null = 15,
  equipment: Equipment = "dumbbell",
): ResistanceExerciseEntry {
  return {
    ...previousEntry,
    equipment,
    sets: repetitions.map((reps, index) => ({
      id: `set:${index}`,
      weightKg,
      repetitions: reps,
      completed: true,
    })),
  };
}

describe("resistance progress", () => {
  it("finds the latest matching exercise and reports overload", () => {
    const draft: ResistanceWorkoutDraft = {
      id: "draft",
      date: "2026-07-18",
      name: "Legs",
      exercises: [],
      createdAt: "2026-07-18T10:00:00.000Z",
      updatedAt: "2026-07-18T10:00:00.000Z",
    };
    const found = findPreviousExercise([previousEvent], draft, "squat");
    expect(formatPreviousSet(found?.sets[0], "dumbbell")).toBe("20 × 10");

    const current = {
      ...previousEntry,
      sets: [{
        id: "new-set",
        weightKg: 22.5,
        repetitions: 10,
        completed: true,
      }],
    };
    expect(getProgressSummary(current, found)).toEqual({
      label: "Weight increased",
      detail: "20 → 22.5 kg",
      tone: "positive",
    });
  });

  it("tracks a resistance-band rep target without a weight recommendation", () => {
    const previous = {
      ...previousEntry,
      equipment: "resistance-band" as const,
      sets: [{
        id: "old-band-set",
        weightKg: null,
        repetitions: 10,
        completed: true,
      }],
    };
    const current = {
      ...previous,
      sets: [{
        id: "new-band-set",
        weightKg: null,
        repetitions: 12,
        completed: true,
      }],
    };

    expect(getProgressSummary(current, previous)).toEqual({
      label: "Building toward 3 × 12",
      detail: "1/3 sets reached 12",
      tone: "neutral",
    });
  });

  it("requires weight for dumbbell and barbell exercises", () => {
    const baseDraft: ResistanceWorkoutDraft = {
      id: "draft",
      date: "2026-07-18",
      name: "Workout",
      exercises: [],
      createdAt: "2026-07-18T10:00:00.000Z",
      updatedAt: "2026-07-18T10:00:00.000Z",
    };
    const set = { id: "set", weightKg: null, repetitions: 10, completed: true };
    expect(isWorkoutReady({
      ...baseDraft,
      exercises: [{ ...previousEntry, equipment: "dumbbell", sets: [set] }],
    })).toBe(false);
    expect(isWorkoutReady({
      ...baseDraft,
      exercises: [{ ...previousEntry, equipment: "barbell", sets: [set] }],
    })).toBe(false);
    expect(isWorkoutReady({
      ...baseDraft,
      exercises: [{ ...previousEntry, equipment: "bodyweight", sets: [set] }],
    })).toBe(true);
    expect(isWorkoutReady({
      ...baseDraft,
      exercises: [{
        ...previousEntry,
        equipment: "resistance-band",
        sets: [set],
      }],
    })).toBe(true);
    expect(formatPreviousSet(set, "resistance-band")).toBe("Band × 10");
  });

  it("recognizes heavier barbell weight", () => {
    const previous: ResistanceExerciseEntry = {
      ...previousEntry,
      equipment: "barbell",
    };
    const current = {
      ...previous,
      sets: [{ ...previous.sets[0], weightKg: 25 }],
    };

    expect(formatPreviousSet(previous.sets[0], "barbell")).toBe("20 × 10");
    expect(getProgressSummary(current, previous)).toEqual({
      label: "Weight increased",
      detail: "20 → 25 kg",
      tone: "positive",
    });
  });

  describe.each(["dumbbell", "barbell"] as const)(
    "%s double progression",
    (equipment) => {
      it("builds toward 3 × 12 at the same weight", () => {
        expect(
          getProgressSummary(exerciseWithSets([12, 11, 10], 15, equipment)),
        ).toEqual({
          label: "Building toward 3 × 12",
          detail: "1/3 sets reached 12",
          tone: "neutral",
        });
      });

      it("is ready when all three clean sets reach at least 12", () => {
        expect(
          getProgressSummary(exerciseWithSets([12, 13, 12], 15, equipment)),
        ).toEqual({
          label: "Ready to increase weight",
          detail: "3/3 sets reached 12",
          tone: "positive",
        });
      });

      it("recognizes the heavier session even when total volume falls", () => {
        expect(getProgressSummary(
          exerciseWithSets([11, 10, 9], 16, equipment),
          exerciseWithSets([12, 12, 12], 15, equipment),
        )).toEqual({
          label: "Weight increased",
          detail: "15 → 16 kg",
          tone: "positive",
        });
      });

      it("prioritizes readiness for the next increase after reaching 3 × 12 again", () => {
        expect(
          getProgressSummary(
            exerciseWithSets([12, 12, 12], 16, equipment),
            exerciseWithSets([12, 12, 12], 15, equipment),
          ).label,
        ).toBe("Ready to increase weight");
      });
    },
  );

  it("does not count unfinished sets or an unconfirmed weight increase", () => {
    const current = exerciseWithSets([12, 12, 12], 16);
    current.sets = current.sets.map((set) => ({ ...set, completed: false }));
    expect(getProgressSummary(current, exerciseWithSets([12, 12, 12]))).toEqual(
      {
        label: "Building toward 3 × 12",
        detail: "0/3 sets reached 12",
        tone: "neutral",
      },
    );
    current.sets[0].completed = true;
    expect(getProgressSummary(current).detail).toBe("1/3 sets reached 12");
  });

  it("requires at least three sets, even if two sets reach the target", () => {
    expect(getProgressSummary(exerciseWithSets([12, 15]))).toEqual({
      label: "Building toward 3 × 12",
      detail: "2/3 sets reached 12",
      tone: "neutral",
    });
  });

  it.each([null, 0, NaN])(
    "does not recommend an increase with invalid weight %s",
    (weight) => {
      expect(getProgressSummary(exerciseWithSets([12, 12, 12], weight)).label)
        .toBe("Building toward 3 × 12");
    },
  );

  it("requires a consistent weight across all sets", () => {
    const current = exerciseWithSets([12, 12, 12]);
    current.sets[1].weightKg = 16;
    expect(getProgressSummary(current, exerciseWithSets([12, 12, 12], 14)))
      .toEqual({
        label: "Building toward 3 × 12",
        detail: "Use the same weight for all sets",
        tone: "neutral",
      });
  });

  it("does not cherry-pick three successful sets out of a longer exercise", () => {
    expect(getProgressSummary(exerciseWithSets([12, 12, 12, 10]))).toEqual({
      label: "Building toward 4 × 12",
      detail: "3/4 sets reached 12",
      tone: "neutral",
    });
    expect(getProgressSummary(exerciseWithSets([12, 12, 12, 12])).label)
      .toBe("Ready to increase weight");
  });

  it.each(["bodyweight", "resistance-band"] as const)(
    "shows rep-target completion for %s",
    (equipment) => {
      expect(
        getProgressSummary(exerciseWithSets([12, 12, 12], null, equipment)),
      ).toEqual({
        label: "Rep target reached",
        detail: "3/3 sets reached 12",
        tone: "positive",
      });
    },
  );

  it("does not treat a lower weight as volume-based regression", () => {
    expect(getProgressSummary(
      exerciseWithSets([12, 11, 10], 14),
      exerciseWithSets([12, 12, 12]),
    )).toEqual({
      label: "Building toward 3 × 12",
      detail: "1/3 sets reached 12",
      tone: "neutral",
    });
  });

  it("does not compare weight with an unfinished or different-equipment baseline", () => {
    const previous = exerciseWithSets([12, 12, 12]);
    previous.sets = previous.sets.map((set) => ({ ...set, completed: false }));
    const current = exerciseWithSets([11, 10, 9], 16);
    expect(getProgressSummary(current, previous).label).toBe(
      "Building toward 3 × 12",
    );
    expect(
      getProgressSummary(current, { ...previous, equipment: "barbell" }).label,
    )
      .toBe("Building toward 3 × 12");
  });
});
