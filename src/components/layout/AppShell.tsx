import { format } from "date-fns";
import { Link, Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation.tsx";

export function AppShell() {
  const currentMonth = format(new Date(), "yyyy-MM");

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="brand" to={`/calendar/${currentMonth}`}>
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Fitness Log</span>
        </Link>
        <span className="local-label">Stored on this device</span>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
