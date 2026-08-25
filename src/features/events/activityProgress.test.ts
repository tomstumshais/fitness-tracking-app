import { describe, expect, it } from "vitest";
import type { EditableFitnessEvent } from "../../domain/fitness.ts";
import {
  findPreviousActivity,
  getActivityProgress,
} from "./activityProgress.ts";

function cycling(
  id: string,
  date: string,
  durationMinutes: number,
  intensity: "low" | "moderate" | "high" = "moderate",
): EditableFitnessEvent {
  return {
    id,
    date,
    type: "cardio",
    name: "Indoor cycling",
    durationMinutes,
    intensity,
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
  };
}

describe("activity progress", () => {
  it("finds the latest earlier session of the exact activity", () => {
    const older = cycling("older", "2026-07-15", 30);
    const previous = cycling("previous", "2026-07-17", 35);
    const current = cycling("current", "2026-07-18", 40);
    const swimming = { ...previous, id: "swim", name: "Swimming" };

    expect(findPreviousActivity([current, older, swimming, previous], current))
      .toBe(previous);
  });

  it("reports a longer session at the same intensity", () => {
    expect(getActivityProgress(
      cycling("current", "2026-07-18", 40),
      cycling("previous", "2026-07-17", 35),
    )).toEqual({
      change: "+5 min (+14%)",
      label: "Longer at same intensity",
      tone: "positive",
    });
  });

  it("compares distance activities by both distance and pace", () => {
    const previous: EditableFitnessEvent = {
      id: "previous-run",
      date: "2026-07-17",
      type: "running",
      durationMinutes: 30,
      distanceKm: 5,
      createdAt: "2026-07-17T10:00:00.000Z",
      updatedAt: "2026-07-17T10:00:00.000Z",
    };
    const current: EditableFitnessEvent = {
      ...previous,
      id: "current-run",
      date: "2026-07-18",
      durationMinutes: 35,
      distanceKm: 6,
      createdAt: "2026-07-18T10:00:00.000Z",
      updatedAt: "2026-07-18T10:00:00.000Z",
    };

    expect(getActivityProgress(current, previous)).toEqual({
      change: "+1 km · 0:10 /km faster",
      label: "Farther with faster pace",
      tone: "positive",
    });
  });

  it("shows physiotherapy history without judging performance", () => {
    const previous = {
      ...cycling("previous", "2026-07-17", 35),
      name: "Physiotherapy",
    };
    const current = {
      ...cycling("current", "2026-07-18", 40),
      name: "Physiotherapy",
    };

    expect(getActivityProgress(current, previous)).toEqual({
      label: "Previous appointment",
      tone: "neutral",
    });
  });
});
