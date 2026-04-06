from fastapi import APIRouter, Query

from app.models.schemas import PokemonSearchResult, SmogonSetResponse
from app.services.smogon_dex import get_smogon_set, search_pokemon


router = APIRouter(prefix="/pokemon", tags=["pokemon"])


@router.get("/search", response_model=list[PokemonSearchResult])
def search_pokemon_species(query: str = Query(min_length=2), limit: int = Query(default=8, ge=1, le=12)) -> list[PokemonSearchResult]:
    return search_pokemon(query, limit=limit)


@router.get("/smogon-set", response_model=SmogonSetResponse)
def get_pokemon_smogon_set(name: str = Query(min_length=1)) -> SmogonSetResponse:
    return get_smogon_set(name)
