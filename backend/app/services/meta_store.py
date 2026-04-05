from __future__ import annotations

from dataclasses import dataclass

from fastapi import HTTPException
from psycopg.errors import UniqueViolation

from app.data.sample_data import dashboard_data
from app.db import get_db_connection, serialize_json
from app.models.schemas import MetaSnapshotCreateRequest


@dataclass(frozen=True)
class MetaSnapshotSeed:
    id: str
    format: str
    source: str
    snapshot_date: str
    active: bool
    weakness_summary: list[str]
    recommendations: list[str]
    threats: list[dict]
    meta_teams: list[dict]


DEFAULT_SNAPSHOT = MetaSnapshotSeed(
    id="reg-h-sample-2026-04-04",
    format=dashboard_data["activeFormat"],
    source="Seeded sample snapshot",
    snapshot_date="2026-04-04",
    active=True,
    weakness_summary=dashboard_data["weaknessSummary"],
    recommendations=dashboard_data["recommendations"],
    threats=dashboard_data["threats"],
    meta_teams=dashboard_data["metaTeams"],
)


def initialize_meta_store() -> None:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS count FROM meta_snapshots")
            snapshot_count = int(cursor.fetchone()["count"])
            seed_active = snapshot_count == 0
            cursor.execute(
                """
                INSERT INTO meta_snapshots (
                    id,
                    format,
                    source,
                    snapshot_date,
                    active,
                    weakness_summary,
                    recommendations,
                    threats,
                    meta_teams
                )
                VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, %s::jsonb, %s::jsonb)
                ON CONFLICT (id) DO UPDATE SET
                    format = EXCLUDED.format,
                    source = EXCLUDED.source,
                    snapshot_date = EXCLUDED.snapshot_date,
                    active = EXCLUDED.active,
                    weakness_summary = EXCLUDED.weakness_summary,
                    recommendations = EXCLUDED.recommendations,
                    threats = EXCLUDED.threats,
                    meta_teams = EXCLUDED.meta_teams,
                    updated_at = NOW()
                """,
                (
                    DEFAULT_SNAPSHOT.id,
                    DEFAULT_SNAPSHOT.format,
                    DEFAULT_SNAPSHOT.source,
                    DEFAULT_SNAPSHOT.snapshot_date,
                    seed_active,
                    serialize_json(DEFAULT_SNAPSHOT.weakness_summary),
                    serialize_json(DEFAULT_SNAPSHOT.recommendations),
                    serialize_json(DEFAULT_SNAPSHOT.threats),
                    serialize_json(DEFAULT_SNAPSHOT.meta_teams),
                ),
            )


def _normalize_snapshot(row: dict) -> dict:
    return {
        "id": row["id"],
        "format": row["format"],
        "source": row["source"],
        "snapshotDate": row["snapshot_date"].isoformat(),
        "active": row["active"],
        "weaknessSummary": row["weakness_summary"],
        "recommendations": row["recommendations"],
        "threats": row["threats"],
        "metaTeams": row["meta_teams"],
    }


def list_meta_snapshots() -> list[dict]:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, format, source, snapshot_date, active, weakness_summary,
                       recommendations, threats, meta_teams
                FROM meta_snapshots
                ORDER BY active DESC, snapshot_date DESC, id ASC
                """
            )
            return [_normalize_snapshot(row) for row in cursor.fetchall()]


def get_active_meta_snapshot() -> dict:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, format, source, snapshot_date, active, weakness_summary,
                       recommendations, threats, meta_teams
                FROM meta_snapshots
                WHERE active = TRUE
                ORDER BY snapshot_date DESC, id ASC
                LIMIT 1
                """
            )
            row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="No active meta snapshot found")

    return _normalize_snapshot(row)


def create_meta_snapshot(payload: MetaSnapshotCreateRequest) -> dict:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            if payload.active:
                cursor.execute("UPDATE meta_snapshots SET active = FALSE, updated_at = NOW()")

            try:
                cursor.execute(
                    """
                    INSERT INTO meta_snapshots (
                        id,
                        format,
                        source,
                        snapshot_date,
                        active,
                        weakness_summary,
                        recommendations,
                        threats,
                        meta_teams,
                        updated_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, %s::jsonb, %s::jsonb, NOW())
                    RETURNING id, format, source, snapshot_date, active, weakness_summary,
                              recommendations, threats, meta_teams
                    """,
                    (
                        payload.id,
                        payload.format,
                        payload.source,
                        payload.snapshotDate,
                        payload.active,
                        serialize_json(payload.weaknessSummary),
                        serialize_json(payload.recommendations),
                        serialize_json([threat.model_dump() for threat in payload.threats]),
                        serialize_json([meta_team.model_dump() for meta_team in payload.metaTeams]),
                    ),
                )
            except UniqueViolation as exc:
                raise HTTPException(status_code=409, detail="Snapshot id already exists") from exc

            row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=500, detail="Failed to create snapshot")

    return _normalize_snapshot(row)


def activate_meta_snapshot(snapshot_id: str) -> dict:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE meta_snapshots SET active = FALSE, updated_at = NOW()")
            cursor.execute(
                """
                UPDATE meta_snapshots
                SET active = TRUE, updated_at = NOW()
                WHERE id = %s
                RETURNING id, format, source, snapshot_date, active, weakness_summary,
                          recommendations, threats, meta_teams
                """,
                (snapshot_id,),
            )
            row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Snapshot not found")

    return _normalize_snapshot(row)
