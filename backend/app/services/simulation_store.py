from __future__ import annotations

from typing import Any
from uuid import uuid4

from fastapi import HTTPException

from app.db import get_db_connection, serialize_json
from app.models.schemas import ShowdownPokemon, ShowdownValidationRequest, SimulationJobCreateRequest
from app.services.meta_store import get_active_meta_snapshot
from app.services.showdown_engine import validate_with_showdown
from app.services.showdown_parser import parse_showdown_team
from app.services.team_store import get_team


def _member_from_showdown(pokemon: ShowdownPokemon) -> dict[str, Any]:
    return {
        "name": pokemon.name,
        "item": pokemon.item or "",
        "ability": pokemon.ability or "",
        "types": [],
        "moves": pokemon.moves,
        "role": "Imported set",
        "teraType": pokemon.tera_type,
        "image": "",
    }


def _normalize_job(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "teamId": row["team_id"],
        "teamName": row["team_name"],
        "opponentMode": row["opponent_mode"],
        "opponentLabel": row["opponent_label"],
        "requestedGames": row["requested_games"],
        "completedGames": row["completed_games"],
        "status": row["status"],
        "createdAt": row["created_at"].isoformat(),
        "startedAt": row["started_at"].isoformat() if row["started_at"] else None,
        "completedAt": row["completed_at"].isoformat() if row["completed_at"] else None,
        "summary": row["summary"],
        "errorMessage": row["error_message"],
    }


def _resolve_opponent_payload(
    payload: SimulationJobCreateRequest, team_format: str
) -> tuple[str, dict[str, Any]]:
    if payload.opponentMode == "top_meta":
        active_snapshot = get_active_meta_snapshot()
        if not active_snapshot["metaTeams"]:
            raise HTTPException(status_code=400, detail="No teams found in the active meta snapshot")

        top_team = active_snapshot["metaTeams"][0]
        return (
            top_team["name"],
            {
                "metaTeamId": top_team["id"],
                "name": top_team["name"],
                "format": top_team["format"],
                "archetype": top_team["archetype"],
                "core": top_team["core"],
                "pressurePoints": top_team["pressurePoints"],
                "plan": top_team["plan"],
                "sourceSnapshotId": active_snapshot["id"],
            },
        )

    if not payload.showdownText or not payload.showdownText.strip():
        raise HTTPException(status_code=400, detail="Showdown text is required for input-team simulations")

    parsed_team = parse_showdown_team(payload.showdownText)
    if not parsed_team:
        raise HTTPException(status_code=400, detail="No Pokemon could be parsed from Showdown text")

    validation = validate_with_showdown(
        ShowdownValidationRequest(
            format=team_format,
            showdownText=payload.showdownText,
        )
    )
    serialized_validation = {
        **validation,
        "pokemon": [member.model_dump() for member in validation["pokemon"]],
    }

    opponent_members = [_member_from_showdown(member) for member in parsed_team]
    opponent_label = " / ".join(member.name for member in parsed_team[:2])
    if len(parsed_team) > 2:
        opponent_label = f"{opponent_label} +{len(parsed_team) - 2}"

    return (
        opponent_label,
        {
            "name": opponent_label,
            "archetype": "Imported opponent",
            "members": opponent_members,
            "showdownText": payload.showdownText,
            "showdownValidation": serialized_validation,
        },
    )


def create_simulation_job(payload: SimulationJobCreateRequest) -> dict[str, Any]:
    team = get_team(payload.teamId)
    opponent_label, opponent_payload = _resolve_opponent_payload(payload, team["format"])
    job_id = f"sim-{uuid4().hex[:10]}"

    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO simulation_jobs (
                    id,
                    team_id,
                    team_name,
                    opponent_mode,
                    opponent_label,
                    opponent_payload,
                    requested_games,
                    completed_games,
                    status,
                    summary,
                    updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s, 0, 'queued', '{}'::jsonb, NOW())
                RETURNING id, team_id, team_name, opponent_mode, opponent_label, requested_games,
                          completed_games, status, summary, error_message, created_at, started_at,
                          completed_at
                """,
                (
                    job_id,
                    team["id"],
                    team["name"],
                    payload.opponentMode,
                    opponent_label,
                    serialize_json(opponent_payload),
                    payload.requestedGames,
                ),
            )
            row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=500, detail="Failed to create simulation job")

    return _normalize_job(row)


def list_simulation_jobs() -> list[dict[str, Any]]:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, team_id, team_name, opponent_mode, opponent_label, requested_games,
                       completed_games, status, summary, error_message, created_at, started_at,
                       completed_at
                FROM simulation_jobs
                ORDER BY created_at DESC
                LIMIT 20
                """
            )
            rows = cursor.fetchall()

    return [_normalize_job(row) for row in rows]


def get_simulation_job(job_id: str) -> dict[str, Any]:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, team_id, team_name, opponent_mode, opponent_label, requested_games,
                       completed_games, status, summary, error_message, created_at, started_at,
                       completed_at
                FROM simulation_jobs
                WHERE id = %s
                """,
                (job_id,),
            )
            row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Simulation job not found")

    return _normalize_job(row)


def claim_next_simulation_job() -> dict[str, Any] | None:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id
                FROM simulation_jobs
                WHERE status = 'queued'
                ORDER BY created_at ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
                """
            )
            job = cursor.fetchone()
            if job is None:
                return None

            cursor.execute(
                """
                UPDATE simulation_jobs
                SET status = 'running', started_at = NOW(), updated_at = NOW()
                WHERE id = %s
                RETURNING id, team_id, team_name, opponent_mode, opponent_label, opponent_payload,
                          requested_games, completed_games, status, summary, error_message,
                          created_at, started_at, completed_at
                """,
                (job["id"],),
            )
            return dict(cursor.fetchone())


def complete_simulation_job(job_id: str, summary: dict[str, Any], completed_games: int) -> dict[str, Any]:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE simulation_jobs
                SET status = 'completed',
                    summary = %s::jsonb,
                    completed_games = %s,
                    completed_at = NOW(),
                    updated_at = NOW()
                WHERE id = %s
                RETURNING id, team_id, team_name, opponent_mode, opponent_label, requested_games,
                          completed_games, status, summary, error_message, created_at, started_at,
                          completed_at
                """,
                (serialize_json(summary), completed_games, job_id),
            )
            row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Simulation job not found")

    return _normalize_job(row)


def fail_simulation_job(job_id: str, error_message: str) -> dict[str, Any]:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE simulation_jobs
                SET status = 'failed',
                    error_message = %s,
                    completed_at = NOW(),
                    updated_at = NOW()
                WHERE id = %s
                RETURNING id, team_id, team_name, opponent_mode, opponent_label, requested_games,
                          completed_games, status, summary, error_message, created_at, started_at,
                          completed_at
                """,
                (error_message, job_id),
            )
            row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Simulation job not found")

    return _normalize_job(row)
