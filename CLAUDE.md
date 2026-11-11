# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Status: greenfield.** No code exists yet. The layout, models, commands and endpoints below describe the *target design*, not files you can open. Don't assume `backend/`, `build_edition`, etc. exist; create them per this spec. Once code lands, trim sections that become self-evident from the code.

## Project

**Working name:** The Daily Calm (rename freely)

A low-cortisol daily newspaper app. Every morning a single, finite **edition** is published: a fixed set of short, calm summaries across India, World, Tech and Sports, plus a **puzzle page** (a daily sudoku for MVP; an MCQ quiz built from that day's stories comes later). When the reader finishes, the app says so. There is no infinite feed.

### Product principles (treat these as requirements)

1. **Finite by design.** An edition has exactly 20 stories: 5 in each of 4 categories. The front page shows each section's lead story in full and the other 4 as headlines; section pages show all 5. Never add infinite scroll, "load more", autoplay or endless recommendations.
2. **Calm tone.** No breaking-news push alerts, no clickbait or alarmist headlines, no engagement-bait copy. Headlines are informative and neutral.
3. **Daily ritual.** One edition per day, published at a fixed time (default 06:00 IST). Past editions live in a read-only archive.
4. **Puzzles tie into the news.** The daily quiz (post-MVP) is generated from that day's edition; reading the paper should help you score.
5. **Respect sources.** We publish short original summaries with a link to the source. We never republish or closely mirror article text (see Content rules).

## Tech stack

- **Backend:** Python 3.12, Django 5, Django REST Framework
- **DB:** PostgreSQL
- **Background jobs:** Celery + Redis (ingestion, summarisation, edition publishing, puzzle generation)
- **LLM:** Used for clustering help, summarisation, headline rewriting and quiz generation, behind a single service interface so the provider can be swapped
- **Frontend:** React + TypeScript (web/PWA first; mobile app later)
- **Admin/editorial:** Django admin for reviewing and publishing editions

## Repository layout

```
backend/
  config/              # Django settings, urls, celery app
  apps/
    sources/           # News sources, RSS/API feeds, fetch logs
    ingestion/         # Fetching, normalising, deduplicating raw items
    stories/           # Story clusters, summaries, categories
    editions/          # Daily edition assembly, scheduling, publishing
    puzzles/           # Sudoku, quiz generation & validation
    readers/           # Users, streaks, progress, scores
  services/
    llm/               # LLM client + prompts (only place that calls the LLM)
  tests/
frontend/
  src/
    pages/             # Today, Archive, Puzzles, Profile
    components/
    api/               # Typed API client
```

## Domain model (core)

- **Source**: name, feed URL / API config, category hints, active flag
- **RawItem**: fetched item (title, url, published_at, snippet, source). Stored for dedup and traceability. Not shown to readers.
- **StoryCluster**: groups RawItems about the same event
- **Story**: our published unit: category, neutral headline, original summary (60–100 words), source links, calm_score, status (`draft` / `approved` / `rejected`)
- **Edition**: date (unique), publish_at, status (`draft` / `scheduled` / `published`), ordered stories
- **Puzzle**: edition, type (`sudoku`; `quiz` and `mini` are post-MVP), payload (JSON), solution (JSON, never sent to client before completion), difficulty
- **QuizQuestion**: puzzle, linked story, question, options, correct index, explanation
- **ReaderProgress**: reader, edition, stories read, puzzle results, completed_at
- **Streak**: reader, current, longest, last_completed_date

## Edition pipeline

Runs as Celery tasks, scheduled the evening before / early morning:

1. **Ingest**: fetch all active sources, normalise, store RawItems, skip duplicates by URL + title similarity
2. **Cluster**: group RawItems about the same event
3. **Rank & filter**: score clusters for importance and calmness; drop gore, sensationalism and pure outrage pieces
4. **Summarise**: generate original summary + neutral headline per selected cluster
5. **Assemble**: build a draft Edition of 20 stories: 5 each from India, World, Tech and Sports. Keep the active category set in settings, not hard-coded (Films is a candidate for later)
6. **Puzzles**: generate sudoku (quiz generation from the edition's stories is post-MVP)
7. **Review**: editor approves/edits in Django admin (human-in-the-loop for MVP)
8. **Publish**: at `publish_at`, edition becomes `published` and immutable

Every step must be idempotent and safe to re-run for a given date.

## Content rules

- Summaries must be written in our own words. Do not copy sentences or closely paraphrase source structure.
- Never store or display full article text. Keep only title, URL, short snippet and metadata.
- Always link to the original source(s) on every story.
- Do not invent facts, quotes or numbers. If the source material is unclear, the summary says less, not more.
- Headlines: no ALL CAPS, no "shocking", "you won't believe", excessive exclamation marks or fear framing.
- Quiz questions must be answerable from the published summary itself.

## Puzzle rules

- **Sudoku**: generated programmatically (not by the LLM); must have exactly one solution; validate with a solver before saving. Difficulty levels by number of givens and solving techniques required.
- **Quiz** (post-MVP): 5 MCQs per edition, 4 options each, one correct answer, short explanation linking back to the story. Validate structure before saving.
- Solutions are never sent to the client until the reader submits or reveals. Sudoku submit takes `{grid}` or `{reveal: true}` and returns `{solved, wrongCells, emptyCells, solution}`, with `solution` only set when solved or revealed (the frontend mock in `src/api/client.ts` follows this contract). Enforce this with separate serializers: the default puzzle serializer has no solution field, and only the submit/reveal response uses the solution serializer.
- Deterministic generation per date (seeded) so a re-run produces the same puzzle. Derive the seed from the edition date plus the puzzle type.

## API conventions

- REST under `/api/v1/`
- Key endpoints: `GET /editions/today`, `GET /editions/{date}`, `GET /editions/archive`, `GET /puzzles/today`, `GET /puzzles/{id}`, `POST /puzzles/{id}/submit`, `GET /me`, `GET /me/history?month=YYYY-MM`
- Only `published` editions are visible to readers
- `GET /me` returns `{memberSince, streak: {current, longest, lastCompletedDate}, readToday, totals: {editionsRead, sudokuSolved, sudokuRevealed}}`. A day counts as read when the reader reaches the end of that day's paper; the current streak ends today or yesterday. `GET /me/history` returns one month of `{date, read, sudoku: "solved" | "revealed" | null}` days plus `prevMonth` / `nextMonth`. Profile copy stays low-pressure: no "don't break your streak" nudges
- Edition responses include `prevDate` / `nextDate` (adjacent published editions; `nextDate` is null for today's). `GET /editions/archive?month=YYYY-MM` returns one month of past editions (`{month, editions: [{date, number, leadHeadline}], prevMonth, nextMonth}`), newest first, excluding today. The archive pages by month; never return or render an unbounded list
- Use DRF serializers for all input validation; keep views thin, put logic in service modules

## Coding conventions

- Python: type hints everywhere, `ruff` for lint + format, business logic in `services.py` per app, not in views or models
- LLM calls only through `services/llm/`; prompts live as versioned templates, not inline strings
- Celery tasks are thin wrappers that call service functions
- Use timezone-aware datetimes; the product timezone is `Asia/Kolkata`. Set both Django `TIME_ZONE` and Celery `timezone` to it so the 06:00 IST beat schedule fires correctly
- Published-edition immutability is enforced in the editions service layer (reject edits to a `published` Edition or its stories/puzzles) and mirrored as read-only in Django admin
- Frontend: TypeScript strict mode, functional components, no infinite lists anywhere
- No secrets in code; use environment variables (`.env.example` lists them)

## Commands

```bash
# Backend
cd backend
python manage.py migrate
python manage.py runserver
celery -A config worker -l info
celery -A config beat -l info
pytest
pytest tests/puzzles/test_sudoku.py::test_unique_solution   # single test
pytest -k dedup                                             # by keyword
ruff check . && ruff format .

# Build a draft edition for a date (manual run)
python manage.py build_edition --date 2026-11-13

# Frontend
cd frontend
npm install
npm run dev
npm run test
npx vitest run src/__tests__/sudoku.test.ts                 # single file
npm run check                                               # lint + typecheck + test + build
npm run lint
```

Frontend (Vite + React 19 + TS strict) serves sample data from `src/api/fixtures.ts` by default. Set `VITE_USE_FIXTURES=false` to call the real API; Vite proxies `/api` to Django on `localhost:8000`. Visual style is a minimal printed newspaper: blackletter masthead (UnifrakturMaguntia), Newsreader for everything else, colour tokens on `:root` in `src/index.css`. Tests use Vitest (`src/__tests__/`); `npm run check` runs lint, typecheck, tests and build.

## Testing expectations

- Unit tests for sudoku generator + solver (uniqueness), quiz validation, edition assembly category mix, dedup logic
- Pipeline tests with recorded fixtures; never hit real feeds or the LLM in tests (mock `services/llm/`)
- A published edition must be immutable; test that

## MVP scope

In: one daily edition (20 stories: 5 each of India, World, Tech, Sports), sudoku, streaks, share card, archive, editor review in admin.

Out for now: Films category, quiz, mini puzzles, push notifications, comments, personalised feeds, ads, multiple languages, native mobile apps.

## Don'ts

- Don't add infinite scroll, feeds or "you might also like" sections
- Don't add urgent push notifications or red badges
- Don't let the LLM generate sudoku grids
- Don't publish anything without the edition passing review
- Don't store full article content from sources