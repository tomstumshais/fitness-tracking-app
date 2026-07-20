import { ZodError } from "zod";
import { predefinedExercises } from "../features/exercises/predefinedExercises.ts";
import { normalizeEventActivityName } from "./activityNameMigration.ts";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type FitnessBackupV3,
  parseFitnessBackup,
} from "./backupSchema.ts";
import { getDatabase } from "./database.ts";

export interface BackupSummary {
  customExercises: number;
  fitnessEvents: number;
  workoutDrafts: number;
  workoutTemplates: number;
}

export async function createFitnessBackup(): Promise<FitnessBackupV3> {
  const database = await getDatabase();
  const transaction = database.transaction(
    [
      "exercises",
      "fitnessEvents",
      "workoutDrafts",
      "workoutTemplates",
      "settings",
    ],
    "readonly",
  );
  const [
    customExercises,
    fitnessEvents,
    workoutDrafts,
    workoutTemplates,
    settings,
  ] = await Promise.all([
    transaction.objectStore("exercises").index("by-source").getAll("custom"),
    transaction.objectStore("fitnessEvents").getAll(),
    transaction.objectStore("workoutDrafts").getAll(),
    transaction.objectStore("workoutTemplates").getAll(),
    transaction.objectStore("settings").getAll(),
  ]);
  await transaction.done;

  return parseFitnessBackup({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      customExercises,
      fitnessEvents,
      workoutDrafts,
      workoutTemplates,
      settings,
    },
  });
}

function assertNoPredefinedNameCollision(backup: FitnessBackupV3) {
  const predefinedNames = new Set(
    predefinedExercises.map((exercise) => exercise.name.toLocaleLowerCase()),
  );
  const collision = backup.data.customExercises.find((exercise) =>
    predefinedNames.has(exercise.name.toLocaleLowerCase())
  );
  if (collision) {
    throw new Error(
      `Custom exercise “${collision.name}” conflicts with a built-in exercise`,
    );
  }
}

export function readFitnessBackup(value: unknown) {
  try {
    const backup = parseFitnessBackup(value);
    assertNoPredefinedNameCollision(backup);
    return backup;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("This file is not a valid Fitness Log backup");
    }
    throw error;
  }
}

export async function restoreFitnessBackup(value: unknown) {
  const backup = readFitnessBackup(value);
  const database = await getDatabase();
  const transaction = database.transaction(
    [
      "exercises",
      "fitnessEvents",
      "workoutDrafts",
      "workoutTemplates",
      "settings",
    ],
    "readwrite",
  );
  const exercises = transaction.objectStore("exercises");
  const existingCustomExercises = await exercises.index("by-source").getAll(
    "custom",
  );

  await Promise.all([
    ...existingCustomExercises.map((exercise) => exercises.delete(exercise.id)),
    transaction.objectStore("fitnessEvents").clear(),
    transaction.objectStore("workoutDrafts").clear(),
    transaction.objectStore("workoutTemplates").clear(),
    transaction.objectStore("settings").clear(),
  ]);
  await Promise.all([
    ...backup.data.customExercises.map((exercise) => exercises.put(exercise)),
    ...backup.data.fitnessEvents.map((event) =>
      transaction.objectStore("fitnessEvents").put(
        normalizeEventActivityName(event),
      )
    ),
    ...backup.data.workoutDrafts.map((draft) =>
      transaction.objectStore("workoutDrafts").put(draft)
    ),
    ...backup.data.workoutTemplates.map((template) =>
      transaction.objectStore("workoutTemplates").put(template)
    ),
    ...backup.data.settings.map((setting) =>
      transaction.objectStore("settings").put(setting)
    ),
  ]);
  await transaction.done;
  return backup;
}

export function summarizeBackup(backup: FitnessBackupV3): BackupSummary {
  return {
    customExercises: backup.data.customExercises.length,
    fitnessEvents: backup.data.fitnessEvents.length,
    workoutDrafts: backup.data.workoutDrafts.length,
    workoutTemplates: backup.data.workoutTemplates.length,
  };
}
