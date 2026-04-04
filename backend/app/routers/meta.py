from fastapi import APIRouter

from app.models.schemas import MetaSnapshotCreateRequest, MetaSnapshotResponse
from app.services.meta_store import (
    activate_meta_snapshot,
    create_meta_snapshot,
    get_active_meta_snapshot,
    list_meta_snapshots,
)

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/snapshots", response_model=list[MetaSnapshotResponse])
def get_meta_snapshots() -> list[MetaSnapshotResponse]:
    return [MetaSnapshotResponse.model_validate(snapshot) for snapshot in list_meta_snapshots()]


@router.get("/snapshots/active", response_model=MetaSnapshotResponse)
def get_active_snapshot() -> MetaSnapshotResponse:
    return MetaSnapshotResponse.model_validate(get_active_meta_snapshot())


@router.post("/snapshots", response_model=MetaSnapshotResponse)
def create_snapshot(payload: MetaSnapshotCreateRequest) -> MetaSnapshotResponse:
    return MetaSnapshotResponse.model_validate(create_meta_snapshot(payload))


@router.post("/snapshots/{snapshot_id}/activate", response_model=MetaSnapshotResponse)
def activate_snapshot(snapshot_id: str) -> MetaSnapshotResponse:
    return MetaSnapshotResponse.model_validate(activate_meta_snapshot(snapshot_id))
