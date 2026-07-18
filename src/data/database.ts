import { type DBSchema, deleteDB, type IDBPDatabase, openDB } from "idb";
import type {
  Exercise,
  FitnessEvent,
  FitnessEventType,
  ResistanceWorkoutDraft,
  WorkoutTemplate,
} from "../domain/fitness.ts";
import { normalizeEventActivityName } from "./activityNameMigration.ts";
import { predefinedExercises } from "../features/exercises/predefinedExercises.ts";

const DATABASE_NAME = "fitness-log";
const DATABASE_VERSION = 3;
const ACTIVITY_NAME_MIGRATION_KEY = "migration:3:activity-names";

export interface SettingRecord {
  key: string;
  value: unknown;
}

interface FitnessDatabaseSchema extends DBSchema {
  exercises: {
    key: string;
    value: Exercise;
    indexes: { "by-equipment": string; "by-source": string };
  };
  fitnessEvents: {
    key: string;
    value: FitnessEvent;
    indexes: { "by-date": string; "by-type": FitnessEventType };
  };
  workoutDrafts: {
    key: string;
    value: ResistanceWorkoutDraft;
    indexes: { "by-date": string; "by-source-event": string };
  };
  workoutTemplates: { key: string; value: WorkoutTemplate };
  settings: { key: string; value: SettingRecord };
}

let databasePromise: Promise<IDBPDatabase<FitnessDatabaseSchema>> | undefined;

async function migrateActivityNames(
  database: IDBPDatabase<FitnessDatabaseSchema>,
) {
  const transaction = database.transaction(
    ["fitnessEvents", "settings"],
    "readwrite",
  );
  const settings = transaction.objectStore("settings");
  if (!await settings.get(ACTIVITY_NAME_MIGRATION_KEY)) {
    const events = transaction.objectStore("fitnessEvents");
    const timestamp = new Date().toISOString();
    await Promise.all(
      (await events.getAll()).map((event) =>
        events.put(normalizeEventActivityName(event, timestamp))
      ),
    );
    await settings.put({ key: ACTIVITY_NAME_MIGRATION_KEY, value: true });
  }
  await transaction.done;
}

export function getDatabase() {
  databasePromise ??= openDB<FitnessDatabaseSchema>(
    DATABASE_NAME,
    DATABASE_VERSION,
    {
      upgrade(database, oldVersion, _newVersion, transaction) {
        if (oldVersion < 1) {
          const exercises = database.createObjectStore("exercises", {
            keyPath: "id",
          });
          exercises.createIndex("by-equipment", "equipment");
          exercises.createIndex("by-source", "source");

          const events = database.createObjectStore("fitnessEvents", {
            keyPath: "id",
          });
          events.createIndex("by-date", "date");
          events.createIndex("by-type", "type");

          const drafts = database.createObjectStore("workoutDrafts", {
            keyPath: "id",
          });
          drafts.createIndex("by-date", "date");
          database.createObjectStore("settings", { keyPath: "key" });
        }
        if (oldVersion < 2) {
          const drafts = transaction.objectStore("workoutDrafts");
          drafts.createIndex("by-source-event", "sourceEventId", {
            unique: true,
          });
          database.createObjectStore("workoutTemplates", { keyPath: "id" });
        }
      },
    },
  ).then(async (database) => {
    const transaction = database.transaction("exercises", "readwrite");
    await Promise.all(
      predefinedExercises.map((item) => transaction.store.put(item)),
    );
    await transaction.done;
    await migrateActivityNames(database);
    return database;
  });

  return databasePromise;
}

export async function resetDatabaseForTests() {
  if (databasePromise) {
    const database = await databasePromise;
    database.close();
    databasePromise = undefined;
  }
  await deleteDB(DATABASE_NAME);
}
