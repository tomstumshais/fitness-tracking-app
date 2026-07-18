import { BackupPanel } from "./components/BackupPanel.tsx";
import { RestoreBackupDialog } from "./components/RestoreBackupDialog.tsx";
import { useBackupActions } from "./useBackupActions.ts";

export function SettingsPage() {
  const backup = useBackupActions();

  return (
    <section className="page">
      <p className="eyebrow">Application</p>
      <h1>Settings</h1>
      <div className="settings-list">
        <article className="settings-row">
          <div>
            <h2>Local storage</h2>
            <p>Your fitness data will stay on this device.</p>
          </div>
          <span className="status-badge active">Active</span>
        </article>
        <BackupPanel
          busy={backup.workState !== "idle"}
          feedback={backup.feedback}
          onExport={() => void backup.exportBackup()}
          onSelectFile={(file) => void backup.selectBackup(file)}
        />
        <article className="settings-row">
          <div>
            <h2>Weight unit</h2>
            <p>Dumbbell load is recorded per dumbbell.</p>
          </div>
          <strong>kg</strong>
        </article>
      </div>
      {backup.candidate && (
        <RestoreBackupDialog
          backup={backup.candidate}
          onCancel={backup.cancelRestore}
          onConfirm={() => void backup.confirmRestore()}
          restoring={backup.workState === "restoring"}
        />
      )}
    </section>
  );
}
