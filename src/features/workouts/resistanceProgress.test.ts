import { describe, expect, it } from "vitest";
import type {
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
      label: "+13% volume",
      tone: "positive",
    });
  });

  it("compares resistance-band progress by completed repetitions", () => {
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
      label: "+20% reps",
      tone: "positive",
    });
  });

  it("requires weight only for dumbbell exercises", () => {
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
});
