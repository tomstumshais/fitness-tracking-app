import type { ChangeEvent } from "react";

interface BackupPanelProps {
  busy: boolean;
  feedback: { kind: "success" | "error"; message: string } | null;
  onExport: () => void;
  onSelectFile: (file: File) => void;
}

export function BackupPanel({
  busy,
  feedback,
  onExport,
  onSelectFile,
}: BackupPanelProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) void onSelectFile(file);
    event.currentTarget.value = "";
  }

  return (
    <article className="backup-panel">
      <div className="backup-panel-heading">
        <div>
          <h2>Backup and restore</h2>
          <p>
            Save a copy before changing devices or clearing browser data.
          </p>
        </div>
        <span className="status-badge active">Ready</span>
      </div>
      <div className="backup-actions">
        <button
          className="primary-button"
          disabled={busy}
          onClick={onExport}
          type="button"
        >
          {busy ? "Working…" : "Download backup"}
        </button>
        <label className="secondary-button file-button">
          Choose backup file
          <input
            accept=".json,application/json"
            className="sr-only"
            disabled={busy}
            onChange={handleFileChange}
            type="file"
          />
        </label>
      </div>
      <p className="backup-note">
        The JSON file includes custom exercises, completed events, workout
        drafts, and app settings. It is not encrypted, so keep it private.
      </p>
      {feedback && (
        <p
          className={`backup-feedback ${feedback.kind}`}
          role={feedback.kind === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
    </article>
  );
}
