interface PwaPanelProps {
  canInstall: boolean;
  installed: boolean;
  isIos: boolean;
  offlineReady: boolean;
  onInstall: () => void;
}

export function PwaPanel({
  canInstall,
  installed,
  isIos,
  offlineReady,
  onInstall,
}: PwaPanelProps) {
  const badge = installed
    ? "Installed"
    : offlineReady
    ? "Offline ready"
    : "Preparing";

  return (
    <article className="pwa-panel">
      <div className="pwa-panel-heading">
        <div>
          <h2>Install and use offline</h2>
          <p>
            Keep Fitness Log on your home screen and open it without internet.
          </p>
        </div>
        <span
          className={`status-badge${
            installed || offlineReady ? " active" : ""
          }`}
        >
          {badge}
        </span>
      </div>
      {installed
        ? (
          <p className="install-message">
            Fitness Log is installed. Your data still stays on this device.
          </p>
        )
        : isIos
        ? (
          <div className="install-instructions">
            <strong>Install on iPhone</strong>
            <ol>
              <li>Open this page in Safari.</li>
              <li>Tap More, then Share (or tap the Share button).</li>
              <li>Choose “Add to Home Screen”.</li>
              <li>Turn on “Open as Web App”, then tap Add.</li>
            </ol>
          </div>
        )
        : canInstall
        ? (
          <button
            className="primary-button pwa-install"
            onClick={onInstall}
            type="button"
          >
            Install Fitness Log
          </button>
        )
        : (
          <p className="install-message">
            Use your browser menu’s install option to add Fitness Log.
          </p>
        )}
      <p className="pwa-note">
        After installing, open the app once while online so the latest version
        is available offline.
      </p>
      {isIos && !installed && (
        <p className="pwa-storage-note">
          Already have entries in Safari? Download a backup first, then restore
          it in the installed app if it opens empty.
        </p>
      )}
    </article>
  );
}
