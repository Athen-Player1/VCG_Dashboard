import re
import os
from typing import Any
from uuid import uuid4

import requests
from fastapi import HTTPException

from app.db import get_db_connection, serialize_json
from app.models.schemas import (
    ShowdownPokemon,
    TeamCreateRequest,
    TeamMemberInput,
    TeamUpdateRequest,
)


SPECIAL_IMAGE_SLUGS = {
    "Ogerpon-W": "ogerpon-wellspring",
    "Bloodmoon Ursaluna": "ursaluna-bloodmoon",
    "Landorus": "landorus-therian",
}

SHOWDOWN_ENGINE_URL = os.getenv("SHOWDOWN_ENGINE_URL", "http://showdown-engine:3100")


def _slugify_species(name: str) -> str:
    if name in SPECIAL_IMAGE_SLUGS:
        return SPECIAL_IMAGE_SLUGS[name]

    slug = name.lower()
    slug = slug.replace(".", "")
    slug = slug.replace("'", "")
    slug = slug.replace("♀", "-f")
    slug = slug.replace("♂", "-m")
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    return slug


def _image_for_species(name: str) -> str:
    slug = _slugify_species(name)
    return f"https://img.pokemondb.net/sprites/scarlet-violet/normal/{slug}.png"


def _member_from_showdown(pokemon: ShowdownPokemon) -> dict[str, Any]:
    return {
        "name": pokemon.name,
        "item": pokemon.item or "",
        "ability": pokemon.ability or "",
        "types": pokemon.types or [],
        "moves": pokemon.moves,
        "role": "Imported set",
        "teraType": pokemon.tera_type,
        "image": _image_for_species(pokemon.name),
    }


def _lookup_species_types(names: list[str]) -> dict[str, list[str]]:
    unique_names = [name for name in dict.fromkeys(name.strip() for name in names if name.strip())]
    if not unique_names:
        return {}

    try:
        response = requests.post(
            f"{SHOWDOWN_ENGINE_URL}/pokemon/species-types",
            json={"names": unique_names},
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException:
        return {}

    resolved: dict[str, list[str]] = {}
    for entry in payload.get("pokemon", []):
        name = str(entry.get("name", "")).strip()
        types = [
            str(type_name).strip()
            for type_name in entry.get("types", [])
            if str(type_name).strip()
        ]
        if name and types:
            resolved[name.casefold()] = types[:2]

    return resolved


def _apply_inferred_types(members: list[dict[str, Any]]) -> list[dict[str, Any]]:
    species_type_map = _lookup_species_types([member.get("name", "") for member in members])
    enriched: list[dict[str, Any]] = []

    for member in members:
        normalized = dict(member)
        if not normalized.get("types") and normalized.get("name"):
            normalized["types"] = species_type_map.get(normalized["name"].casefold(), [])
        enriched.append(normalized)

    return enriched


def _normalize_member(member: TeamMemberInput | dict[str, Any]) -> dict[str, Any]:
    payload = member.model_dump() if isinstance(member, TeamMemberInput) else dict(member)
    name = payload.get("name", "").strip()
    return {
        "name": name,
        "item": (payload.get("item") or "").strip(),
        "ability": (payload.get("ability") or "").strip(),
        "types": [item.strip() for item in payload.get("types", []) if item.strip()],
        "moves": [item.strip() for item in payload.get("moves", []) if item.strip()],
        "role": (payload.get("role") or "").strip(),
        "teraType": payload.get("teraType"),
        "image": (payload.get("image") or _image_for_species(name)).strip(),
    }


def initialize_team_store() -> None:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, members
                FROM teams
                """
            )
            rows = cursor.fetchall()

            for row in rows:
                members = row.get("members") or []
                normalized_members = _apply_inferred_types(
                    [_normalize_member(member) for member in members]
                )

                if normalized_members != members:
                    cursor.execute(
                        """
                        UPDATE teams
                        SET members = %s::jsonb, updated_at = NOW()
                        WHERE id = %s
                        """,
                        (
                            serialize_json(normalized_members),
                            row["id"],
                        ),
                    )


def list_teams() -> list[dict[str, Any]]:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, format, archetype, elo, notes, tags, members
                FROM teams
                ORDER BY created_at ASC
                """
            )
            rows = cursor.fetchall()

    return [dict(row) for row in rows]


def get_team(team_id: str) -> dict[str, Any]:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, format, archetype, elo, notes, tags, members
                FROM teams
                WHERE id = %s
                """,
                (team_id,),
            )
            row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Team not found")

    return dict(row)


def create_team_from_showdown(
    team_name: str, team_format: str, pokemon: list[ShowdownPokemon]
) -> dict[str, Any]:
    team_id = f"team-{uuid4().hex[:8]}"
    members = _apply_inferred_types([_member_from_showdown(member) for member in pokemon])
    team = {
        "id": team_id,
        "name": team_name,
        "format": team_format,
        "archetype": "Imported Team",
        "elo": None,
        "notes": "Imported from Pokemon Showdown export.",
        "tags": ["Imported", "Showdown"],
        "members": members,
    }

    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO teams (id, name, format, archetype, elo, notes, tags, members)
                VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb)
                RETURNING id, name, format, archetype, elo, notes, tags, members
                """,
                (
                    team["id"],
                    team["name"],
                    team["format"],
                    team["archetype"],
                    team["elo"],
                    team["notes"],
                    serialize_json(team["tags"]),
                    serialize_json(team["members"]),
                ),
            )
            row = cursor.fetchone()

    return dict(row)


def create_team(payload: TeamCreateRequest) -> dict[str, Any]:
    team_id = f"team-{uuid4().hex[:8]}"
    members = _apply_inferred_types([_normalize_member(member) for member in payload.members])
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO teams (id, name, format, archetype, elo, notes, tags, members)
                VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb)
                RETURNING id, name, format, archetype, elo, notes, tags, members
                """,
                (
                    team_id,
                    payload.name,
                    payload.format,
                    payload.archetype,
                    None,
                    payload.notes,
                    serialize_json(payload.tags),
                    serialize_json(members),
                ),
            )
            row = cursor.fetchone()

    return dict(row)


def update_team(team_id: str, payload: TeamUpdateRequest) -> dict[str, Any]:
    members = _apply_inferred_types([_normalize_member(member) for member in payload.members])
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE teams
                SET
                    name = %s,
                    format = %s,
                    archetype = %s,
                    notes = %s,
                    tags = %s::jsonb,
                    members = %s::jsonb,
                    updated_at = NOW()
                WHERE id = %s
                RETURNING id, name, format, archetype, elo, notes, tags, members
                """,
                (
                    payload.name,
                    payload.format,
                    payload.archetype,
                    payload.notes,
                    serialize_json(payload.tags),
                    serialize_json(members),
                    team_id,
                ),
            )
            row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Team not found")

    return dict(row)


def delete_team(team_id: str) -> None:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM teams WHERE id = %s", (team_id,))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Team not found")
