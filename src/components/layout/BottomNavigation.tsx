import { format } from "date-fns";
import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Calendar",
    path: `/calendar/${format(new Date(), "yyyy-MM")}`,
    icon: "calendar",
  },
  { label: "Exercises", path: "/exercises", icon: "dumbbell" },
  { label: "Settings", path: "/settings", icon: "settings" },
] as const;

export function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="Main navigation">
      {navItems.map(({ label, path, icon }) => (
        <NavLink
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          key={path}
          to={path}
        >
          <NavIcon name={icon} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function NavIcon({ name }: { name: (typeof navItems)[number]["icon"] }) {
  const paths = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    dumbbell: (
      <>
        <path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.2 15a1.7 1.7 0 0 0-.6-1A1.7 1.7 0 0 0 2.5 13.6H2v-4h.5A1.7 1.7 0 0 0 4.2 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.6 4.2a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 10 2.5V2h4v.5a1.7 1.7 0 0 0 1 1.7 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.6a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.9v4h-.9a1.7 1.7 0 0 0-1.7 1Z" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="nav-icon" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
