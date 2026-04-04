# VGC Dashboard

Dockerized web app for building, saving, and analyzing Pokemon VGC teams.

## Stack

- Frontend: Next.js App Router + Tailwind CSS
- Backend: FastAPI
- Database: PostgreSQL
- Orchestration: Docker Compose

## Planned Features

- Save multiple VGC teams
- Import teams from Pokemon Showdown export text
- Team weakness and role analysis
- Compare against top meta teams by format snapshot
- Generate matchup plans against common teams
- Later-phase automated battle simulator

## Run

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`
