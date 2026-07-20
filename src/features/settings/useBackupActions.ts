import { useState } from "react";
import type { FitnessBackupV3 } from "../../data/backupSchema.ts";
import {
  createFitnessBackup,
  readFitnessBackup,
  restoreFitnessBackup,
} from "../../data/backupRepository.ts";
import { useAppDispatch } from "../../app/hooks.ts";
import { loadEvents } from "../events/eventsSlice.ts";
import { loadExercises } from "../exercises/exercisesSlice.ts";
import { loadTemplates } from "../templates/templatesSlice.ts";
import { loadWorkoutDrafts } from "../workouts/workoutsSlice.ts";
import { downloadFitnessBackup, MAX_BACKUP_FILE_BYTES } from "./backupFile.ts";

type WorkState = "idle" | "exporting" | "restoring";
type Feedback = { kind: "success" | "error"; message: string } | null;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function useBackupActions() {
  const dispatch = useAppDispatch();
  const [candidate, setCandidate] = useState<FitnessBackupV3 | null>(null);
  const [workState, setWorkState] = useState<WorkState>("idle");
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function exportBackup() {
    setWorkState("exporting");
    setFeedback(null);
    try {
      downloadFitnessBackup(await createFitnessBackup());
      setFeedback({ kind: "success", message: "Backup downloaded." });
    } catch (error) {
      setFeedback({ kind: "error", message: errorMessage(error) });
    } finally {
      setWorkState("idle");
    }
  }

  async function selectBackup(file: File) {
    setFeedback(null);
    if (file.size > MAX_BACKUP_FILE_BYTES) {
      setFeedback({
        kind: "error",
        message: "Backup must be smaller than 5 MB.",
      });
      return;
    }
    try {
      const value: unknown = JSON.parse(await file.text());
      setCandidate(readFitnessBackup(value));
    } catch (error) {
      setCandidate(null);
      setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  async function confirmRestore() {
    if (!candidate) return;
    setWorkState("restoring");
    setFeedback(null);
    try {
      await restoreFitnessBackup(candidate);
      await Promise.all([
        dispatch(loadExercises()).unwrap(),
        dispatch(loadEvents()).unwrap(),
        dispatch(loadWorkoutDrafts()).unwrap(),
        dispatch(loadTemplates()).unwrap(),
      ]);
      setCandidate(null);
      setFeedback({
        kind: "success",
        message: "Backup restored successfully.",
      });
    } catch (error) {
      setCandidate(null);
      setFeedback({ kind: "error", message: errorMessage(error) });
    } finally {
      setWorkState("idle");
    }
  }

  return {
    candidate,
    feedback,
    workState,
    exportBackup,
    selectBackup,
    confirmRestore,
    cancelRestore: () => setCandidate(null),
  };
}
