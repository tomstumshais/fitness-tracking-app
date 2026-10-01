import { type DBSchema, deleteDB, type IDBPDatabase, openDB } from "idb";
import type {
  Exercise,
  FitnessEvent,
  FitnessEventType,
  ResistanceWorkoutDraft,
  WorkoutTemplate,
} from "../domain/fitness.ts";
import { normalizeEventActivityName } from "./activityNameMigration.ts";
import {
  addDumbbellGripWeight,
  repairMissedDumbbellWeightAdjustment,
} from "./dumbbellWeightMigration.ts";
import { predefinedExercises } from "../features/exercises/predefinedExercises.ts";

const DATABASE_NAME = "fitness-log";
const DATABASE_VERSION = 7;
const ACTIVITY_NAME_MIGRATION_KEY = "migration:3:activity-names";
const DUMBBELL_WEIGHT_MIGRATION_KEY = "migration:5:dumbbell-grip-weight";
const SEPTEMBER_11_WEIGHT_MIGRATION_KEY =
  "migration:6:2026-09-11-dumbbell-weight";
const SEPTEMBER_11_WEIGHT_REPAIR_KEY =
  "migration:7:2026-09-11-dumbbell-weight-repair";
const SEPTEMBER_11_2026 = "2026-09-11";

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

async function migrateDumbbellGripWeights(
  database: IDBPDatabase<FitnessDatabaseSchema>,
) {
  const transaction = database.transaction(
    ["fitnessEvents", "workoutDrafts", "settings"],
    "readwrite",
  );
  const settings = transaction.objectStore("settings");
  if (!await settings.get(DUMBBELL_WEIGHT_MIGRATION_KEY)) {
    const timestamp = new Date().toISOString();
    const events = transaction.objectStore("fitnessEvents");
    const drafts = transaction.objectStore("workoutDrafts");
    const [storedEvents, storedDrafts] = await Promise.all([
      events.getAll(),
      drafts.getAll(),
    ]);
    const eventWrites = storedEvents.map((event) => {
      if (event.type !== "resistance") return;
      const migrated = addDumbbellGripWeight(event, timestamp);
      return migrated === event ? undefined : events.put(migrated);
    });
    const draftWrites = storedDrafts.map((draft) => {
      const migrated = addDumbbellGripWeight(draft, timestamp);
      return migrated === draft ? undefined : drafts.put(migrated);
    });
    await Promise.all([...eventWrites, ...draftWrites]);
    await settings.put({ key: DUMBBELL_WEIGHT_MIGRATION_KEY, value: true });
  }
  await transaction.done;
}

async function migrateSeptember11DumbbellWeights(
  database: IDBPDatabase<FitnessDatabaseSchema>,
) {
  const transaction = database.transaction(
    ["fitnessEvents", "workoutDrafts", "settings"],
    "readwrite",
  );
  const settings = transaction.objectStore("settings");
  if (!await settings.get(SEPTEMBER_11_WEIGHT_MIGRATION_KEY)) {
    const timestamp = new Date().toISOString();
    const events = transaction.objectStore("fitnessEvents");
    const drafts = transaction.objectStore("workoutDrafts");
    const [storedEvents, storedDrafts] = await Promise.all([
      events.index("by-date").getAll(SEPTEMBER_11_2026),
      drafts.getAll(),
    ]);
    const resistanceEvents = storedEvents.filter((event) =>
      event.type === "resistance"
    );
    const eventIds = new Set(resistanceEvents.map((event) => event.id));
    const eventWrites = resistanceEvents.map((event) => {
      const migrated = addDumbbellGripWeight(event, timestamp);
      return migrated === event ? undefined : events.put(migrated);
    });
    const draftWrites = storedDrafts.map((draft) => {
      if (!draft.sourceEventId || !eventIds.has(draft.sourceEventId)) return;
      const migrated = addDumbbellGripWeight(draft, timestamp);
      return migrated === draft ? undefined : drafts.put(migrated);
    });
    await Promise.all([...eventWrites, ...draftWrites]);
    await settings.put({
      key: SEPTEMBER_11_WEIGHT_MIGRATION_KEY,
      value: true,
    });
  }
  await transaction.done;
}

async function repairSeptember11DumbbellWeights(
  database: IDBPDatabase<FitnessDatabaseSchema>,
) {
  const transaction = database.transaction(
    ["fitnessEvents", "workoutDrafts", "settings"],
    "readwrite",
  );
  const settings = transaction.objectStore("settings");
  if (!await settings.get(SEPTEMBER_11_WEIGHT_REPAIR_KEY)) {
    const timestamp = new Date().toISOString();
    const events = transaction.objectStore("fitnessEvents");
    const drafts = transaction.objectStore("workoutDrafts");
    const [storedEvents, storedDrafts] = await Promise.all([
      events.index("by-date").getAll(SEPTEMBER_11_2026),
      drafts.index("by-date").getAll(SEPTEMBER_11_2026),
    ]);
    const resistanceEvents = storedEvents.filter((event) =>
      event.type === "resistance"
    );
    const eventWrites = resistanceEvents.map((event) => {
      const migrated = repairMissedDumbbellWeightAdjustment(event, timestamp);
      return migrated === event ? undefined : events.put(migrated);
    });
    const draftWrites = storedDrafts.map((draft) => {
      const migrated = repairMissedDumbbellWeightAdjustment(draft, timestamp);
      return migrated === draft ? undefined : drafts.put(migrated);
    });
    await Promise.all([...eventWrites, ...draftWrites]);
    await settings.put({
      key: SEPTEMBER_11_WEIGHT_REPAIR_KEY,
      value: true,
    });
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
    await migrateDumbbellGripWeights(database);
    await migrateSeptember11DumbbellWeights(database);
    await repairSeptember11DumbbellWeights(database);
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
