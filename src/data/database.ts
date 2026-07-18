import { type DBSchema, deleteDB, type IDBPDatabase, openDB } from "idb";
import type {
  Exercise,
  FitnessEvent,
  FitnessEventType,
  ResistanceWorkoutDraft,
} from "../domain/fitness.ts";
import { predefinedExercises } from "../features/exercises/predefinedExercises.ts";

const DATABASE_NAME = "fitness-log";
const DATABASE_VERSION = 1;

interface SettingRecord {
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
    indexes: { "by-date": string };
  };
  settings: { key: string; value: SettingRecord };
}

let databasePromise: Promise<IDBPDatabase<FitnessDatabaseSchema>> | undefined;

export function getDatabase() {
  databasePromise ??= openDB<FitnessDatabaseSchema>(
    DATABASE_NAME,
    DATABASE_VERSION,
    {
      upgrade(database) {
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
      },
    },
  ).then(async (database) => {
    const transaction = database.transaction("exercises", "readwrite");
    await Promise.all(
      predefinedExercises.map((item) => transaction.store.put(item)),
    );
    await transaction.done;
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
