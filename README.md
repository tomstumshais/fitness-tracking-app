# Fitness Tracking App

A mobile-first, local-first fitness tracker for logging running, walking,
cardio, and resistance workouts. Resistance sessions focus on dumbbell and
bodyweight exercises, with previous-set context and progressive overload
comparisons.

## Product principles

- Works well on an iPhone and adapts to desktop screens.
- Stores personal fitness data in the browser; no backend is required for
  version one.
- Uses permanent exercise identities so historical progress remains comparable.
- Records dumbbell weight in kilograms per dumbbell.
- Supports multiple completed fitness events per day.
- Keeps components focused and generally below 100 lines.

## Technology

- React and TypeScript
- React Router with hash-based routes for GitHub Pages
- Redux Toolkit
- IndexedDB through `idb`
- Deno for dependency management and project tasks
- Vite for development and production builds
- Vitest and Testing Library

## Development

Install dependencies:

```sh
deno install
```

Start the development server:

```sh
deno task dev
```

Run all quality checks:

```sh
deno task check
```

Build the GitHub Pages bundle:

```sh
deno task build
```

## Current functionality

- Monday-first calendar with refresh-safe day routes
- IndexedDB schema for exercises, completed events, resistance drafts, and
  settings
- Curated dumbbell and bodyweight exercise library
- Search and equipment filters
- Persistent custom exercise creation, editing, and deletion
- Running, walking, outdoor bicycle, indoor spin bike, and swimming logs
- Resistance workouts with custom names and autosaved in-progress drafts
- Set-by-set kg/repetition logging with previous-session values
- Progressive-overload comparisons by volume or bodyweight repetitions
- Completed workout cards and calendar activity markers
- Versioned JSON backup and validated, atomic restore of local user data
- Installable home-screen PWA with an offline-cached application shell
- Mobile navigation and responsive desktop layout

## First version status

The planned first-version milestones are complete. Fitness data remains local to
the browser or installed app, so JSON backups are recommended before changing
devices or clearing browser storage.

The application is expected to be published at
`https://tomstumshais.github.io/fitness-tracking-app/`.
