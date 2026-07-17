import { format } from "date-fns";
import { createHashRouter, Navigate, type RouteObject } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell.tsx";
import { CalendarPage } from "../features/calendar/CalendarPage.tsx";
import { DayPage } from "../features/day/DayPage.tsx";
import { ExercisesPage } from "../features/exercises/ExercisesPage.tsx";
import { SettingsPage } from "../features/settings/SettingsPage.tsx";

const currentMonth = format(new Date(), "yyyy-MM");

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to={`/calendar/${currentMonth}`} replace />,
      },
      { path: "calendar/:month", element: <CalendarPage /> },
      { path: "day/:date", element: <DayPage /> },
      { path: "exercises", element: <ExercisesPage /> },
      { path: "settings", element: <SettingsPage /> },
      {
        path: "*",
        element: <Navigate to={`/calendar/${currentMonth}`} replace />,
      },
    ],
  },
];

export const router = createHashRouter(routes);
