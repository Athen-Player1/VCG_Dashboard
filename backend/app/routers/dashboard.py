from fastapi import APIRouter

from app.services.dashboard_service import build_dashboard_payload

router = APIRouter()


@router.get("/dashboard")
def get_dashboard() -> dict:
    return build_dashboard_payload()
