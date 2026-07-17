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

## Planned first version

1. Calendar and daily event management
2. Running, walking, cardio, and resistance event forms
3. Dumbbell and bodyweight exercise library with custom exercises
4. In-workout set logging with autosaved drafts
5. Previous-session and progressive overload comparisons
6. IndexedDB persistence and JSON backup/restore
7. Installable offline PWA

The application is expected to be published at
`https://tomstumshais.github.io/fitness-tracking-app/`.
