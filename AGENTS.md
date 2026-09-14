# BCGP Bike Count — Agent Guide

Mobile-friendly web app for the [Bicycle Coalition of Greater Philadelphia](https://bicyclecoalition.org/) (BCGP). Volunteers use it in the field to record bike/ped observations during timed count sessions and export CSV results.

Deployed to GitHub Pages at `https://mdzhang.github.io/bcgp-bike-count/`.

## What the app does

1. **Start a session** — pick a predefined Philadelphia location, date, and AM (7:30–9:00) or PM (4:30–6:00) period.
2. **Count in 15-minute segments** — navigate segments, start/end each block, see a live countdown.
3. **Record observations** — tap-friendly form for direction, helmet, Indego, gender, mobility type, optional notes.
4. **Review & export** — end session, filter results, download CSV.

Progress persists in `localStorage` across refreshes. Storage clears only when the user submits **Start Session** on a new session (not when opening the new-session form).

## Tech stack

| Layer       | Choice                                                                    |
| ----------- | ------------------------------------------------------------------------- |
| Build       | Vite 6                                                                    |
| UI          | React 19 + TypeScript (strict)                                            |
| Styling     | Tailwind CSS v4 (`@tailwindcss/vite`, `@theme` tokens in `src/index.css`) |
| Icons       | `lucide-react`                                                            |
| Utilities   | `lodash` (sparingly, e.g. location filter)                                |
| Lint/format | Biome (not ESLint/Prettier)                                               |
| Tests       | Vitest + React Testing Library + happy-dom                                |
| Deploy      | GitHub Actions → GitHub Pages (`base: /bcgp-bike-count/` in production)   |

**Prefer not to add** unless clearly needed: Redux, React Router, CSS-in-JS, ESLint, heavy UI libraries. `@radix-ui/react-popover` is in `package.json` but unused — use custom components instead.

## Project structure

```
src/
├── App.tsx                 # Session bootstrap, localStorage load/save
├── main.tsx
├── index.css               # Tailwind + design tokens + keyframe animations
├── types.ts                # Core domain types (Session, CountEntry, CountFormState)
├── constants.ts            # Locations, session periods, BCGP branding
├── components/
│   ├── SessionStart.tsx    # New session form (location typeahead, date, period)
│   ├── CountSession.tsx    # Main counting flow (orchestrator)
│   ├── CountForm.tsx       # Observation input (segmented controls)
│   ├── SegmentSelector.tsx # Dot slider + swipe for 15-min segments
│   ├── SegmentTimer.tsx    # Timer bar, start prompt, schedule warning
│   ├── EntryProgress.tsx   # Horizontal “observations so far” badges
│   ├── EntryBadge.tsx      # Single observation badge
│   ├── SessionResultsTable.tsx  # Post-session table, filters, CSV download
│   ├── Layout.tsx / SiteHeader.tsx
├── utils/
│   ├── segments.ts         # 15-min segment generation, time display
│   ├── segmentState.ts     # Segment lifecycle (idle → running → ended)
│   ├── session.ts          # Schedule checks, countdown helpers
│   ├── sessionPeriod.ts    # AM/PM period → Date range
│   ├── entries.ts          # Form ↔ entry conversion, flatten for table
│   ├── csv.ts              # CSV generation (ET timezone, minute precision)
│   └── persistedSession.ts # localStorage serialize/deserialize
└── test/
    ├── setup.ts
    └── fixtures.ts         # Shared observation combos for tests
```

## Domain model (short)

- **Session** — location + start/end `Date` for the full count window.
- **Segment** — 15-minute slice of a session (`createSegments`).
- **SegmentState** — discriminated union: `idle` | `running` | `ended` (with timing fields). Stored as `segmentStates: Record<number, SegmentState>`.
- **CountEntry** — one observation (direction stored as E/W/N/S; CSV exports as `east/west` or `north/south`).
- **PersistedCountState** — everything saved to localStorage (active segment, segment states, entries, form draft, session-ended flag).

## User flow & key UI patterns

- **Sticky header** — site header (`top-0`), then session header with location + segment nav (`top-[53px]`).
- **Segmented controls** — direction, gender, and mobility buttons use connected `SegmentedGroup` styling (shared border, dividers).
- **Fixed bottom bar** — Submit/Update while counting; end-session confirmation is a bottom sheet (not a top banner).
- **Schedule warning** — amber banner below the header rule when outside scheduled segment time.
- **Ended segment** — Submit button disabled/greyed; timer frozen.

## Design system

Defined in `src/index.css` `@theme`:

- **`bcgp` (`#d3623d`)** — selected/toggle states, active segment dots.
- **`accent` (`#059669`)** — Submit/Update only.
- **Red** — destructive (End Session, Cancel edit).
- **Neutrals** — monochrome UI; avoid introducing new accent colors.
- **Mobile-first** — large tap targets, `safe-area-inset` padding on fixed elements, minimal chrome.

Use Tailwind utility classes directly. Avoid new CSS files unless adding shared animations (see bottom-sheet keyframes in `index.css`).

## Implementation preferences

1. **Minimal scope** — smallest correct diff; don’t refactor unrelated code.
2. **Match existing patterns** — read surrounding code before adding abstractions.
3. **State** — prefer consolidated state objects (`countState`, `SegmentState` union) over many parallel `useState` hooks. Persist via `onPersist` callback + `useEffect` in `CountSession`.
4. **Components** — default exports for components; named exports for utils/types. Keep business logic in `utils/`, not components.
5. **Forms** — controlled components; `CountFormState` + `formToEntry` / `entryToForm` in `utils/entries.ts`.
6. **Comments** — only for non-obvious logic; code should be self-explanatory.
7. **Tests** — add meaningful tests for CSV format and user flows; fixtures in `src/test/fixtures.ts`. Run with `TZ=America/New_York npm test`.

## CSV export format

Header:

```
start_time,end_time,direction,gender,helmet,indego,emoto,ebike,scooter,notes
```

- `start_time` / `end_time` — segment bounds in **Eastern Time**, minute precision (e.g. `2026-09-14 07:30 ET`).
- Booleans — `"true"` / `"false"`.
- `direction` — `east/west` or `north/south` (not E/W/N/S).
- `notes` — quoted, with internal quotes escaped.

## Commands

```bash
npm run dev          # local dev server
npm run build        # typecheck + production build
npm run preview      # preview production build
npm run lint         # biome check
npm run lint:fix     # biome check --write
npm test             # vitest (single run)
npm test:watch       # vitest watch mode
```

## CI

- **`.github/workflows/ci.yml`** — lint, build, test on PR/push to `main`.
- **`.github/workflows/deploy.yml`** — deploy `dist/` to GitHub Pages on push to `main`.

## Common tasks for agents

| Task                     | Where to look                                                      |
| ------------------------ | ------------------------------------------------------------------ |
| Change count form fields | `CountForm.tsx`, `types.ts`, `entries.ts`, `csv.ts`, test fixtures |
| Segment timing behavior  | `segmentState.ts`, `CountSession.tsx`, `SegmentTimer.tsx`          |
| Persistence / refresh    | `persistedSession.ts`, `App.tsx`                                   |
| Results table / filters  | `SessionResultsTable.tsx`                                          |
| Locations or periods     | `constants.ts`, `SessionStart.tsx`                                 |
| Styling tokens           | `src/index.css`                                                    |

When changing observation fields or CSV columns, update **both** `csv.ts` and `src/test/fixtures.ts` / `csv.test.ts`.
