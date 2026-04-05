from __future__ import annotations

import os
from typing import Any

import requests
from fastapi import HTTPException

from app.models.schemas import (
    ShowdownPokemon,
    ShowdownValidationRequest,
    TeamMemberInput,
)
from app.services.showdown_parser import parse_showdown_team


SHOWDOWN_ENGINE_URL = os.getenv("SHOWDOWN_ENGINE_URL", "http://showdown-engine:3100")


def _build_showdown_export(members: list[TeamMemberInput]) -> str:
    sections: list[str] = []
    for member in members:
        if not member.name.strip():
            continue

        lines = [member.name.strip()]
        if member.item.strip():
            lines[0] = f"{lines[0]} @ {member.item.strip()}"
        if member.ability.strip():
            lines.append(f"Ability: {member.ability.strip()}")
        if member.teraType and member.teraType.strip():
            lines.append(f"Tera Type: {member.teraType.strip()}")
        for move in member.moves[:4]:
            if move.strip():
                lines.append(f"- {move.strip()}")
        sections.append("\n".join(lines))

    return "\n\n".join(sections)


def _payload_to_export(payload: ShowdownValidationRequest) -> str:
    if payload.showdownText and payload.showdownText.strip():
        return payload.showdownText.strip()

    if payload.members:
        return _build_showdown_export(payload.members)

    raise HTTPException(status_code=400, detail="Provide Showdown text or team members to validate")


def validate_with_showdown(payload: ShowdownValidationRequest) -> dict[str, Any]:
    showdown_text = _payload_to_export(payload)

    try:
        response = requests.post(
            f"{SHOWDOWN_ENGINE_URL}/teams/validate",
            json={
                "format": payload.format,
                "showdownText": showdown_text,
            },
            timeout=20,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail="Showdown engine service is unavailable") from exc

    if response.status_code >= 400:
        detail = "Showdown validation failed"
        try:
            detail = response.json().get("detail", detail)
        except ValueError:
            pass
        raise HTTPException(status_code=502, detail=detail)

    result = response.json()
    pokemon = parse_showdown_team(result.get("exportedTeam", showdown_text))

    return {
        "formatRequested": result["formatRequested"],
        "formatResolved": result["formatResolved"],
        "valid": result["valid"],
        "issues": result.get("issues", []),
        "packedTeam": result.get("packedTeam", ""),
        "exportedTeam": result.get("exportedTeam", showdown_text),
        "pokemon": [ShowdownPokemon.model_validate(member) for member in pokemon],
    }
