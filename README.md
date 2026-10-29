# Fitness Tracking App

A mobile-first, local-first fitness tracker for logging running, walking,
cardio, and resistance workouts. Resistance sessions support dumbbell, barbell,
bodyweight and resistance-band exercises, with previous-set context and
progressive overload comparisons.

## Product principles

- Works well on an iPhone and adapts to desktop screens.
- Stores personal fitness data in the browser; no backend is required for
  version one.
- Uses permanent exercise identities so historical progress remains comparable.
- Gives persisted fitness records stable IDs plus creation/update timestamps.
- Records dumbbell weight in kilograms per dumbbell.
- Records total barbell weight in kilograms, including the bar and plates.
- Supports multiple completed fitness events per day.
- Keeps components focused and generally below 100 lines.
- Keeps persistence behind repositories and feature state, separate from UI
  components.
- Keeps templates, future analytics, and future synchronization as independent
  feature modules, ready for a centralized entitlement layer if needed later.

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
- Migratable IndexedDB schema for exercises, completed events, resistance
  drafts, workout templates, and settings
- Curated dumbbell, barbell (including EZ-bar curls), resistance-band and
  bodyweight exercise library
- Search and equipment filters
- Persistent custom exercise creation, editing, and deletion
- Running, walking, outdoor cycling, indoor cycling, swimming, and physiotherapy
  logs
- Resistance workouts with custom names and autosaved in-progress drafts
- Reusable resistance workout templates with exercise order and set counts
- Editing completed resistance workouts without changing their stable identity
- Duplicating a completed workout into a new editable, incomplete draft
- Set-by-set kg/repetition logging with previous-session values
- Double-progression statuses for resistance workouts: build toward 3 × 12,
  increase weight after three completed clean sets of at least 12 reps at the
  same weight, and recognize heavier sessions without volume-based regression
  labels. Additional logged sets must also reach 12 reps before an increase is
  suggested; band and bodyweight exercises show rep-target completion.
- Marking a set Done confirms clean reps. Weight increases are informational;
  readiness for another increase is highlighted after the rep target is met.
- Previous-session performance comparisons for cardio, running, and walking
- Autosaved resistance exercise notes with previous-note context
- Completed workout cards and calendar activity markers
- Versioned JSON backup with backward migration and validated, atomic restore of
  local user data, including templates
- Installable home-screen PWA with an offline-cached application shell
- Mobile navigation and responsive desktop layout

## First version status

The planned first-version milestones are complete. Fitness data remains local to
the browser or installed app, so JSON backups are recommended before changing
devices or clearing browser storage.

## Future milestone ideas

- Early support and monetization: optionally add a discreet **Buy Me a Coffee**
  button in Settings/About or the app footer, without interrupting workout
  logging or placing features behind a paywall.

The application is expected to be published at
`https://tomstumshais.github.io/fitness-tracking-app/`.
