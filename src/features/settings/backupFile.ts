import type { FitnessBackupV2 } from "../../data/backupSchema.ts";

export const MAX_BACKUP_FILE_BYTES = 5 * 1024 * 1024;

export function downloadFitnessBackup(backup: FitnessBackupV2) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fitness-log-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  globalThis.setTimeout(() => URL.revokeObjectURL(url), 0);
}
