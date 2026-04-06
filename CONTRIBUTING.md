# Contributing

This project ships through Docker images published from `master`, so the most helpful contributions are small, testable changes that keep the app, API, and worker in sync.

## Workflow

1. Make your change locally in a focused commit.
2. Run the checks that match the area you touched.
3. Push to `master` to trigger the `Publish Containers` GitHub Actions workflow.
4. After the workflow finishes, refresh the running stack with `docker compose pull && docker compose up -d`.

## Local Setup

### Requirements

- Docker Desktop or a compatible Docker Engine + Compose setup

### Start The Stack

```bash
docker compose up --build -d
```

Open:

- App: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`

### Stop The Stack

```bash
docker compose down
```

## Checks

Run the smallest relevant checks before pushing.

### Frontend

```bash
docker compose exec -T web npm run lint
```

### Backend

```bash
docker compose exec -T api pytest
```

### Local Image Builds

Use these when you want to confirm a container still builds cleanly before you push:

```bash
docker build -f frontend/Dockerfile -t vgc-dashboard-frontend-local ./frontend
docker build -f backend/Dockerfile -t vgc-dashboard-backend-local ./backend
```

## Deployment Notes

- `docker-compose.yml` is wired to pull GHCR images, not your local source tree.
- A local code change will not appear in the running app until the published images are updated.
- Pushes to `master` trigger the `Publish Containers` workflow in `.github/workflows/publish-containers.yml`.

## Code Expectations

- Keep changes scoped to the request you are solving.
- Do not revert unrelated user work in a dirty tree.
- Prefer updating tests when you change backend behavior or recommendation logic.
- Keep UI changes consistent with the existing visual language unless the task is explicitly a redesign.

## Useful Commands

### View Running Services

```bash
docker compose ps
```

### Tail Logs

```bash
docker compose logs -f web
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f showdown-engine
```

### Refresh To Latest Published Images

```bash
docker compose pull
docker compose up -d
```
