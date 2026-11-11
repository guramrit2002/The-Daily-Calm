# The Daily Calm: frontend

React + TypeScript (Vite) web app for The Daily Calm, a finite daily newspaper with a puzzle page. Styled as a minimal printed newspaper.

## Run it

Requires Node 20.19 or later.

```bash
npm install
npm run dev        # http://localhost:5173
```

Until the Django backend exists, the app serves built-in sample data from `src/api/*Fixtures.ts`. To use the real API instead, copy `.env.example` to `.env.local` and set `VITE_USE_FIXTURES=false`. The dev server proxies `/api` to `http://localhost:8000`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only |
| `npm run test` | Unit tests (Vitest); `npx vitest run src/__tests__/sudoku.test.ts` runs one file |
| `npm run check` | Lint, type-check, test and build: run before pushing |

## Pages

| Route | Page |
|---|---|
| `/` | Today's front page: each section's lead story plus headlines |
| `/section/:category` | One section of today's paper (India, World, Tech, Sports) |
| `/puzzles` | Daily sudoku |
| `/archive` | Past editions, one month at a time (`?month=YYYY-MM`) |
| `/archive/:date` | A past edition's front page; `/archive/:date/section/:category` for its sections |
| `/profile` | Reading streak, totals and a monthly reading calendar |

## Code layout

- `src/api/`: typed API client (`client.ts`), response types (`types.ts`) and sample fixtures. Components never import fixtures directly. The sudoku solution fixture is only read by the mock check in `client.ts`, mirroring the server rule that solutions are never sent before the reader solves or reveals.
- `src/pages/`: one component per route.
- `src/components/`: shared pieces (masthead, edition view, sudoku board).
- `src/dates.ts`, `src/format.ts`, `src/sudoku.ts`: pure helpers, covered by tests in `src/__tests__/`.
- `src/index.css`: all styles. Colour tokens are on `:root`.

## Deploying

The app uses client-side routing, so the host must serve `index.html` for every path that isn't a file (an SPA fallback). Otherwise a reload on `/archive/2026-11-10` returns 404.
