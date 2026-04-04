from fastapi import APIRouter, Response

from app.models.schemas import (
    TeamAnalysisResponse,
    ShowdownImportRequest,
    ShowdownImportResponse,
    TeamCreateRequest,
    TeamResponse,
    TeamUpdateRequest,
)
from app.services.team_analysis import build_team_analysis
from app.services.showdown_parser import parse_showdown_team
from app.services.team_store import (
    create_team,
    create_team_from_showdown,
    delete_team,
    get_team,
    list_teams,
    update_team,
)

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamResponse])
def get_teams() -> list[TeamResponse]:
    return [TeamResponse.model_validate(team) for team in list_teams()]


@router.get("/{team_id}", response_model=TeamResponse)
def get_team_by_id(team_id: str) -> TeamResponse:
    return TeamResponse.model_validate(get_team(team_id))


@router.get("/{team_id}/analysis", response_model=TeamAnalysisResponse)
def get_team_analysis(team_id: str) -> TeamAnalysisResponse:
    team = TeamResponse.model_validate(get_team(team_id))
    return build_team_analysis(team)


@router.post("", response_model=TeamResponse)
def create_new_team(payload: TeamCreateRequest) -> TeamResponse:
    return TeamResponse.model_validate(create_team(payload))


@router.patch("/{team_id}", response_model=TeamResponse)
def update_existing_team(team_id: str, payload: TeamUpdateRequest) -> TeamResponse:
    return TeamResponse.model_validate(update_team(team_id, payload))


@router.delete("/{team_id}", status_code=204)
def delete_existing_team(team_id: str) -> Response:
    delete_team(team_id)
    return Response(status_code=204)


@router.post("/import-showdown", response_model=ShowdownImportResponse)
def import_showdown_team(payload: ShowdownImportRequest) -> ShowdownImportResponse:
    pokemon = parse_showdown_team(payload.showdown_text)
    return ShowdownImportResponse(team_name=payload.name, format=payload.format, pokemon=pokemon)


@router.post("/import-showdown/save", response_model=TeamResponse)
def save_imported_showdown_team(payload: ShowdownImportRequest) -> TeamResponse:
    pokemon = parse_showdown_team(payload.showdown_text)
    saved_team = create_team_from_showdown(payload.name, payload.format, pokemon)
    return TeamResponse.model_validate(saved_team)
