from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.routers.dashboard import router as dashboard_router
from app.routers.meta import router as meta_router
from app.routers.simulation import router as simulation_router
from app.routers.teams import router as teams_router
from app.services.meta_store import initialize_meta_store
from app.services.team_store import initialize_team_store
from app.services.victory_road_import import sync_latest_regulation_snapshot

app = FastAPI(title="VGC Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()
    initialize_team_store()
    initialize_meta_store()
    try:
        sync_latest_regulation_snapshot()
    except Exception:
        pass


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(dashboard_router)
app.include_router(meta_router)
app.include_router(simulation_router)
app.include_router(teams_router)
