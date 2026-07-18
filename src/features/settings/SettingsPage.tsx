export function SettingsPage() {
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
        <article className="settings-row">
          <div>
            <h2>Backup and restore</h2>
            <p>Export or import a versioned JSON backup.</p>
          </div>
          <span className="status-badge">Planned</span>
        </article>
        <article className="settings-row">
          <div>
            <h2>Weight unit</h2>
            <p>Dumbbell load is recorded per dumbbell.</p>
          </div>
          <strong>kg</strong>
        </article>
      </div>
    </section>
  );
}
