from fastapi import APIRouter

from app.models.schemas import ShowdownImportRequest, ShowdownImportResponse
from app.services.showdown_parser import parse_showdown_team

router = APIRouter(prefix="/teams", tags=["teams"])


@router.post("/import-showdown", response_model=ShowdownImportResponse)
def import_showdown_team(payload: ShowdownImportRequest) -> ShowdownImportResponse:
    pokemon = parse_showdown_team(payload.showdown_text)
    return ShowdownImportResponse(team_name=payload.name, format=payload.format, pokemon=pokemon)
