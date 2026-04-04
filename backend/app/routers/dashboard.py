from fastapi import APIRouter

from app.data.sample_data import dashboard_data

router = APIRouter()


@router.get("/dashboard")
def get_dashboard() -> dict:
    return dashboard_data
