# The Daily Calm

A low-cortisol daily newspaper. Each morning a single, finite edition of 20 short, neutral summaries across India, World, Tech and Sports, plus a daily sudoku. When you reach the end, the paper says so. There is no infinite feed.

## Repository

| Path | Contents |
|---|---|
| `frontend/` | React + TypeScript web app. Works today with sample data; see [frontend/README.md](frontend/README.md) |
| `backend/` | Django + DRF API and edition pipeline (in progress). `backend/scripts/read_rss.py` reads RSS/Atom feeds into normalised items |
| `CLAUDE.md` | Product principles, domain model, pipeline, API contracts and conventions |

## Quick start

```bash
cd frontend
npm install
npm run dev
```
