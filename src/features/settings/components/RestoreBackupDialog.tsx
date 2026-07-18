import { format } from "date-fns";
import type { FitnessBackupV2 } from "../../../data/backupSchema.ts";
import { summarizeBackup } from "../../../data/backupRepository.ts";

interface RestoreBackupDialogProps {
  backup: FitnessBackupV2;
  restoring: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RestoreBackupDialog({
  backup,
  restoring,
  onCancel,
  onConfirm,
}: RestoreBackupDialogProps) {
  const summary = summarizeBackup(backup);
  const exported = format(new Date(backup.exportedAt), "d MMM yyyy, HH:mm");

  return (
    <div className="dialog-overlay" role="presentation">
      <section
        aria-describedby="restore-warning"
        aria-labelledby="restore-title"
        aria-modal="true"
        className="form-dialog restore-dialog"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Check before restoring</p>
            <h2 id="restore-title">Restore this backup?</h2>
          </div>
          <button
            aria-label="Close restore dialog"
            className="dialog-close"
            disabled={restoring}
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </div>
        <p className="restore-date">Created {exported}</p>
        <dl className="backup-summary">
          <div>
            <dt>Completed events</dt>
            <dd>{summary.fitnessEvents}</dd>
          </div>
          <div>
            <dt>Custom exercises</dt>
            <dd>{summary.customExercises}</dd>
          </div>
          <div>
            <dt>Workout drafts</dt>
            <dd>{summary.workoutDrafts}</dd>
          </div>
          <div>
            <dt>Workout templates</dt>
            <dd>{summary.workoutTemplates}</dd>
          </div>
        </dl>
        <p className="restore-warning" id="restore-warning">
          This replaces the user-created data currently on this device. Built-in
          exercises will stay available. This action cannot be undone unless you
          download the current data first.
        </p>
        <div className="dialog-actions">
          <button
            className="secondary-button"
            disabled={restoring}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={restoring}
            onClick={onConfirm}
            type="button"
          >
            {restoring ? "Restoring…" : "Replace and restore"}
          </button>
        </div>
      </section>
    </div>
  );
}
