import { z } from "zod";
import type {
  Exercise,
  FitnessEvent,
  ResistanceWorkoutDraft,
  WorkoutTemplate,
} from "../domain/fitness.ts";
import type { SettingRecord } from "./database.ts";

export const BACKUP_FORMAT = "fitness-log-backup";
export const BACKUP_VERSION = 2;

export interface FitnessBackupV1 {
  format: typeof BACKUP_FORMAT;
  version: 1;
  exportedAt: string;
  data: {
    customExercises: Exercise[];
    fitnessEvents: FitnessEvent[];
    workoutDrafts: ResistanceWorkoutDraft[];
    settings: SettingRecord[];
  };
}

export interface FitnessBackupV2 {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: FitnessBackupV1["data"] & {
    workoutTemplates: WorkoutTemplate[];
  };
}

const identifier = z.string().trim().min(1);
const timestamp = z.string().datetime();
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const name = z.string().trim().min(1).max(120);
const notes = z.string().max(2_000).optional();
const equipment = z.enum(["dumbbell", "bodyweight"]);
const muscleGroup = z.enum([
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "glutes",
  "core",
  "full-body",
]);

const customExercise = z.object({
  id: identifier.startsWith("custom:"),
  name,
  equipment,
  muscleGroup,
  source: z.literal("custom"),
  createdAt: timestamp,
  updatedAt: timestamp,
}).strict();

const resistanceSet = z.object({
  id: identifier,
  weightKg: z.number().finite().nonnegative().nullable(),
  repetitions: z.number().int().nonnegative(),
  completed: z.boolean(),
}).strict();

const resistanceExercise = z.object({
  id: identifier,
  exerciseId: identifier,
  exerciseName: name,
  equipment,
  sets: z.array(resistanceSet).max(100),
}).strict();

const distanceEventBase = {
  id: identifier,
  date: calendarDate,
  durationMinutes: z.number().finite().positive(),
  distanceKm: z.number().finite().positive(),
  notes,
  createdAt: timestamp,
  updatedAt: timestamp,
};

const fitnessEvent = z.discriminatedUnion("type", [
  z.object({ ...distanceEventBase, type: z.literal("running") }).strict(),
  z.object({ ...distanceEventBase, type: z.literal("walking") }).strict(),
  z.object({
    id: identifier,
    date: calendarDate,
    type: z.literal("cardio"),
    name,
    durationMinutes: z.number().finite().positive(),
    intensity: z.enum(["low", "moderate", "high"]),
    notes,
    createdAt: timestamp,
    updatedAt: timestamp,
  }).strict(),
  z.object({
    id: identifier,
    date: calendarDate,
    type: z.literal("resistance"),
    name,
    durationMinutes: z.number().finite().positive().optional(),
    notes,
    exercises: z.array(resistanceExercise).min(1).max(200),
    createdAt: timestamp,
    updatedAt: timestamp,
  }).strict(),
]);

const workoutDraft = z.object({
  id: identifier,
  date: calendarDate,
  name,
  exercises: z.array(resistanceExercise).max(200),
  sourceEventId: identifier.optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
}).strict();

const workoutTemplateExercise = z.object({
  id: identifier,
  exerciseId: identifier,
  exerciseName: name,
  equipment,
  setCount: z.number().int().min(1).max(100),
}).strict();

const workoutTemplate = z.object({
  id: identifier.startsWith("template:"),
  name,
  exercises: z.array(workoutTemplateExercise).min(1).max(200),
  createdAt: timestamp,
  updatedAt: timestamp,
}).strict();

const jsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonValue),
    z.record(z.string(), jsonValue),
  ])
);

const setting = z.object({ key: identifier, value: jsonValue }).strict();

function requireUniqueIds(
  values: { id: string }[],
  context: z.RefinementCtx,
  path: (string | number)[],
) {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value.id)) {
      context.addIssue({
        code: "custom",
        message: `Duplicate ID: ${value.id}`,
        path: [...path, index, "id"],
      });
    }
    seen.add(value.id);
  });
}

function validateResistanceEntries(
  entries: z.infer<typeof resistanceExercise>[],
  context: z.RefinementCtx,
  path: (string | number)[],
) {
  requireUniqueIds(entries, context, path);
  entries.forEach((entry, entryIndex) => {
    requireUniqueIds(entry.sets, context, [...path, entryIndex, "sets"]);
  });
}

const backupDataV1 = {
  customExercises: z.array(customExercise).max(5_000),
  fitnessEvents: z.array(fitnessEvent).max(50_000),
  workoutDrafts: z.array(workoutDraft).max(5_000),
  settings: z.array(setting).max(1_000),
};

const fitnessBackupV1Schema: z.ZodType<FitnessBackupV1> = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(1),
  exportedAt: timestamp,
  data: z.object(backupDataV1).strict(),
}).strict();

export const fitnessBackupSchema: z.ZodType<FitnessBackupV2> = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: timestamp,
  data: z.object({
    ...backupDataV1,
    workoutTemplates: z.array(workoutTemplate).max(5_000),
  }).strict(),
}).strict().superRefine((backup, context) => {
  requireUniqueIds(backup.data.customExercises, context, [
    "data",
    "customExercises",
  ]);
  requireUniqueIds(backup.data.fitnessEvents, context, [
    "data",
    "fitnessEvents",
  ]);
  requireUniqueIds(backup.data.workoutDrafts, context, [
    "data",
    "workoutDrafts",
  ]);
  requireUniqueIds(backup.data.workoutTemplates, context, [
    "data",
    "workoutTemplates",
  ]);
  const settingKeys = new Set<string>();
  backup.data.settings.forEach((setting, index) => {
    if (settingKeys.has(setting.key)) {
      context.addIssue({
        code: "custom",
        message: `Duplicate setting key: ${setting.key}`,
        path: ["data", "settings", index, "key"],
      });
    }
    settingKeys.add(setting.key);
  });

  backup.data.workoutDrafts.forEach((draft, index) => {
    validateResistanceEntries(draft.exercises, context, [
      "data",
      "workoutDrafts",
      index,
      "exercises",
    ]);
  });
  backup.data.workoutTemplates.forEach((template, index) => {
    requireUniqueIds(template.exercises, context, [
      "data",
      "workoutTemplates",
      index,
      "exercises",
    ]);
  });
  backup.data.fitnessEvents.forEach((event, index) => {
    if (event.type === "resistance") {
      validateResistanceEntries(event.exercises, context, [
        "data",
        "fitnessEvents",
        index,
        "exercises",
      ]);
    }
  });

  const normalizedNames = new Set<string>();
  backup.data.customExercises.forEach((exercise, index) => {
    const normalized = exercise.name.toLocaleLowerCase();
    if (normalizedNames.has(normalized)) {
      context.addIssue({
        code: "custom",
        message: `Duplicate exercise name: ${exercise.name}`,
        path: ["data", "customExercises", index, "name"],
      });
    }
    normalizedNames.add(normalized);
  });
});

export function parseFitnessBackup(value: unknown) {
  if (
    typeof value === "object" && value !== null && "version" in value &&
    value.version === 1
  ) {
    const backup = fitnessBackupV1Schema.parse(value);
    return fitnessBackupSchema.parse({
      ...backup,
      version: BACKUP_VERSION,
      data: { ...backup.data, workoutTemplates: [] },
    });
  }
  return fitnessBackupSchema.parse(value);
}
