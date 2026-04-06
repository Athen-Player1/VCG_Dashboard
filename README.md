# VGC Dashboard

VGC Dashboard is a Dockerized team-building and matchup-prep workspace for Pokemon VGC.

It lets you build and save teams, import from Pokemon Showdown, analyze structural weaknesses, compare against the current meta snapshot, generate matchup plans, and run queued simulation batches through a dedicated Showdown-backed service.

## Demo

![VGC Dashboard demo](./docs/media/readme-demo.gif)

## What The App Does

- Save and manage multiple VGC teams
- Edit full six-slot team shells with roles, moves, tera types, and live sprite previews
- Import teams from Pokemon Showdown export text
- Validate teams through a dedicated internal Showdown engine service
- Generate deterministic team analysis, including weakness charts and structural recommendations
- Compare saved teams against the active meta snapshot
- Create matchup plans against top teams and repeated archetypes
- Keep a team-specific playbook with default game plans, pilot notes, and threat notes
- Run background 10-game simulation batches through the worker service
- Import tournament-based meta snapshots from Victory Road event pages

## Architecture

The project is split into five runtime services:

- `web`: Next.js frontend on port `3000`
- `api`: FastAPI backend on port `8000`
- `worker`: background simulation worker using the same backend codebase
- `showdown-engine`: Node service built on `pokemon-showdown` for validation, packing, type lookup, and battle batches
- `db`: PostgreSQL 16

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: FastAPI, Pydantic, Requests, BeautifulSoup
- Database: PostgreSQL
- Simulation/validation service: Node.js + `pokemon-showdown`
- Orchestration: Docker Compose

## Key Workspaces

### Dashboard

- Overview of saved teams
- Threat radar and weakness summaries from the active snapshot
- Meta team plan cards
- Dashboard team selector for the lead widget

### Teams

- Team list and team detail pages
- Team builder for the current six
- Team playbook section with generated guidance plus editable notes
- Team settings for metadata, tags, and matchup notebook entries

### Analysis

- Structural analysis desk for a selected saved team
- Weakness chart and defensive buckets
- Coverage checks, recommendations, and threat framing

### Meta

- Active snapshot overview
- Matchup summaries against stored top teams
- Archetype-level planning
- Snapshot management and Victory Road import flow

### Testing

- Queue 10-game simulation jobs
- Run against the active top meta team or a pasted Showdown opponent
- Store results, repeated issues, and follow-up recommendations

## Current Data Flow

### Teams

Saved teams live in PostgreSQL. The backend normalizes member data and fills in missing species types through the Showdown engine when possible.

### Meta Snapshots

The app stores dated meta snapshots in PostgreSQL. On startup, the backend attempts to sync the latest completed Victory Road result for the current regulation and set it as the active snapshot.

### Simulation

Simulation jobs are stored in PostgreSQL and processed by the worker container.

- Pasted input-team runs use direct Showdown battle-stream execution when a valid packed team is available.
- Snapshot-team runs also use Showdown battle execution when full stored sets exist.
- Heuristic fallback still exists for cases where the opponent snapshot lacks enough real set data.
- Exact mirror matches are normalized to a neutral 50/50 split so side order and random-choice bot behavior do not imply a fake edge.

## Getting Started

### Requirements

- Docker Desktop or a compatible Docker Engine + Compose setup

### Start The App

```bash
docker compose up --build -d
```

Open:

- App: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`

### Stop The App

```bash
docker compose down
```

### Reset Containers But Keep Database Volume

```bash
docker compose down
docker compose up --build -d
```

### Reset Everything Including Postgres Data

```bash
docker compose down -v
docker compose up --build -d
```

## Common Developer Commands

### Rebuild Everything

```bash
docker compose up --build -d
```

### View Container Status

```bash
docker compose ps
```

### View Logs

```bash
docker compose logs -f api
docker compose logs -f web
docker compose logs -f worker
docker compose logs -f showdown-engine
```

### Frontend Lint

```bash
docker compose exec -T web npm run lint
```

### Backend Test Run

```bash
docker compose exec -T api pytest
```

### Open A Shell In A Container

```bash
docker compose exec web sh
docker compose exec api sh
```

## Environment Notes

`docker-compose.yml` wires the services together with these important runtime values:

- `API_BASE_URL=http://api:8000` for server-side frontend requests inside Docker
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` for browser requests from your machine
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/vgc_dashboard`
- `SHOWDOWN_ENGINE_URL=http://showdown-engine:3100`

## Repository Layout

```text
backend/
  app/
    models/
    routers/
    services/
frontend/
  app/
  components/
  lib/
showdown-engine/
docker-compose.yml
MASTER_PLAN.md
```

## Current Caveats

- The simulation lane is useful and integrated, but it is still an MVP and not a perfect competitive battle model.
- Random legal-choice bots are still part of the current Showdown execution path.
- Meta automation is centered on Victory Road event results rather than ladder trends.
- Some generated planning text is deterministic heuristic guidance, not a fully learned strategic model.

## Quality Status

Current workflow expectations in this repo:

- frontend linting should pass in Docker
- backend code should compile and pytest should run in Docker
- the app should boot cleanly through `docker compose up --build -d`

## Product Direction

The project is already live across the full requested loop:

- saved teams
- Showdown import
- builder editing
- structural analysis
- stored meta snapshots
- matchup planning
- team playbooks
- queued simulations
- Victory Road tournament ingestion

The remaining work is mostly polish, better heuristics, stronger simulation fidelity, and UX improvements rather than missing core product areas.

## Related Docs

- Product/build plan: [MASTER_PLAN.md](./MASTER_PLAN.md)
