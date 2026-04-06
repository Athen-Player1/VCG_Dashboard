from __future__ import annotations

import json
import re
from functools import lru_cache

import requests
from fastapi import HTTPException

from app.models.schemas import PokemonSearchResult, SmogonSetResponse


SMOGON_SPECIES_INDEX_URL = "https://www.smogon.com/dex/sv/pokemon/"
SMOGON_SET_URL = "https://www.smogon.com/dex/sv/pokemon/{slug}/vgc25-regulation-i/"
SMOGON_FALLBACK_SET_URL = "https://www.smogon.com/dex/sv/pokemon/{slug}/vgc/"
USER_AGENT = "VGC-Dashboard/1.0 Smogon lookup"


def search_pokemon(query: str, limit: int = 8) -> list[PokemonSearchResult]:
    normalized_query = _normalize_name(query)
    if len(normalized_query) < 2:
        return []

    matches: list[tuple[tuple[int, int, str], PokemonSearchResult]] = []
    for pokemon in _load_species_index():
        normalized_name = _normalize_name(pokemon["name"])
        score = _score_species_match(normalized_query, normalized_name)
        if score is None:
            continue

        formats = [str(entry) for entry in pokemon.get("formats", [])]
        matches.append(
            (
                score,
                PokemonSearchResult(
                    name=pokemon["name"],
                    types=[str(entry) for entry in pokemon.get("types", [])],
                    formats=formats,
                    smogonSetAvailable=any("VGC" in format_name for format_name in formats),
                ),
            )
        )

    matches.sort(key=lambda item: item[0])
    return [item[1] for item in matches[: max(1, min(limit, 12))]]


def get_smogon_set(species_name: str) -> SmogonSetResponse:
    slug = _slugify_name(species_name)
    data = _load_pokemon_page(slug)
    strategies = data.get("strategies", [])
    strategy = _pick_best_strategy(strategies)
    if not strategy:
        raise HTTPException(status_code=404, detail=f"No Smogon strategy set found for {species_name}")

    moveset = strategy.get("movesets", [{}])[0]
    item = _first_value(moveset.get("items"))
    ability = _first_value(moveset.get("abilities"))
    nature = _first_value(moveset.get("natures"))
    tera_type = _first_value(moveset.get("teratypes"))
    moves = [_first_move(slot) for slot in moveset.get("moveslots", [])]
    species = str(moveset.get("pokemon") or species_name).strip()
    source_url = SMOGON_SET_URL.format(slug=slug)

    species_match = next((entry for entry in _load_species_index() if _normalize_name(entry["name"]) == _normalize_name(species)), None)
    species_types = [str(entry) for entry in (species_match or {}).get("types", [])]

    return SmogonSetResponse(
        species=species,
        format=str(strategy.get("format") or "VGC"),
        setName=str(moveset.get("name") or "Smogon Set"),
        item=item,
        ability=ability,
        moves=[move for move in moves if move],
        teraType=tera_type,
        nature=nature,
        types=species_types,
        sourceUrl=source_url,
    )


@lru_cache(maxsize=1)
def _load_species_index() -> list[dict]:
    dex_settings = _fetch_dex_settings(SMOGON_SPECIES_INDEX_URL)
    for rpc_name, payload in dex_settings.get("injectRpcs", []):
        if rpc_name == '["dump-basics",{"gen":"sv"}]':
            pokemon = payload.get("pokemon", [])
            return [entry for entry in pokemon if entry.get("name") and entry.get("isNonstandard") != "CAP"]
    raise HTTPException(status_code=502, detail="Smogon species index format changed unexpectedly")


@lru_cache(maxsize=256)
def _load_pokemon_page(slug: str) -> dict:
    for url_template in (SMOGON_SET_URL, SMOGON_FALLBACK_SET_URL):
        dex_settings = _fetch_dex_settings(url_template.format(slug=slug))
        inject_rpcs = dex_settings.get("injectRpcs", [])
        if inject_rpcs:
            payload = inject_rpcs[-1][1]
            if payload.get("strategies"):
                return payload
    raise HTTPException(status_code=404, detail=f"No Smogon strategy page found for {slug}")


def _fetch_dex_settings(url: str) -> dict:
    try:
        response = requests.get(url, timeout=30, headers={"User-Agent": USER_AGENT})
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail="Smogon lookup is unavailable") from exc

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Smogon lookup failed for {url}")

    match = re.search(r"dexSettings\s*=\s*(\{.*?\})</script>", response.text, re.S)
    if not match:
        raise HTTPException(status_code=502, detail="Smogon page format changed unexpectedly")

    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="Smogon payload could not be parsed") from exc


def _normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def _slugify_name(value: str) -> str:
    return (
        value.strip()
        .lower()
        .replace(".", "")
        .replace("'", "")
        .replace("♀", "-f")
        .replace("♂", "-m")
        .replace(" ", "-")
    )


def _score_species_match(query: str, normalized_name: str) -> tuple[int, int, str] | None:
    if normalized_name == query:
        return (0, len(normalized_name), normalized_name)
    if normalized_name.startswith(query):
        return (1, len(normalized_name), normalized_name)
    if query in normalized_name:
        return (2, len(normalized_name), normalized_name)
    return None


def _pick_best_strategy(strategies: list[dict]) -> dict | None:
    ranked = sorted(
        (strategy for strategy in strategies if strategy.get("movesets")),
        key=lambda strategy: _strategy_priority(str(strategy.get("format") or "")),
        reverse=True,
    )
    return ranked[0] if ranked else None


def _strategy_priority(format_name: str) -> tuple[int, int, int]:
    if format_name == "VGC":
        return (2, 0, 0)

    match = re.match(r"VGC(\d{2}) Regulation ([A-Z])", format_name)
    if match:
        return (3, int(match.group(1)), ord(match.group(2)))

    if format_name.startswith("VGC"):
        return (1, 0, 0)

    if format_name == "Doubles":
        return (0, 0, 0)

    return (-1, 0, 0)


def _first_value(values: list | None) -> str | None:
    if not values:
        return None
    value = values[0]
    return str(value).strip() if value else None


def _first_move(slot: list[dict] | None) -> str | None:
    if not slot:
        return None
    move = slot[0].get("move")
    return str(move).strip() if move else None
