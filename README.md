# VGC Dashboard

Dockerized web app for building, saving, analyzing, comparing, and testing Pokemon VGC teams.

## Stack

- Frontend: Next.js App Router + Tailwind CSS
- Backend: FastAPI
- Database: PostgreSQL
- Orchestration: Docker Compose

## Current Features

- Save and manage multiple VGC teams
- Import teams from Pokemon Showdown export text
- Edit full six-slot team shells
- Run deterministic team weakness and role analysis
- Import dated meta snapshots, including Victory Road tournament pages
- Compare saved teams against the active snapshot
- Generate matchup plans against top teams and common archetypes
- Queue background 10-game simulation batches against the top meta team or a pasted Showdown team
- Validate and normalize teams through a dedicated Showdown engine service before sim preflight

## Run

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`

## Notes

- The simulation lane is currently an MVP background workflow using a stored heuristic runner.
- Team validation and packing now run through a dedicated internal service built on the official `pokemon-showdown` package.
- The architecture is set up so a fuller Pokemon Showdown engine can replace the core simulator later without rewriting the app shell.
