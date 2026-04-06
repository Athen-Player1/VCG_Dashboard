import json
import os
from contextlib import contextmanager
from typing import Iterator

import psycopg
from psycopg.rows import dict_row


DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/vgc_dashboard"
)


@contextmanager
def get_db_connection() -> Iterator[psycopg.Connection]:
    connection = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_db() -> None:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS teams (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    format TEXT NOT NULL,
                    archetype TEXT NOT NULL,
                    elo INTEGER,
                    notes TEXT NOT NULL DEFAULT '',
                    playbook JSONB NOT NULL DEFAULT '{}'::jsonb,
                    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
                    members JSONB NOT NULL DEFAULT '[]'::jsonb,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cursor.execute(
                """
                ALTER TABLE teams
                ADD COLUMN IF NOT EXISTS playbook JSONB NOT NULL DEFAULT '{}'::jsonb
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS meta_snapshots (
                    id TEXT PRIMARY KEY,
                    format TEXT NOT NULL,
                    source TEXT NOT NULL,
                    snapshot_date DATE NOT NULL,
                    active BOOLEAN NOT NULL DEFAULT FALSE,
                    weakness_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
                    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
                    threats JSONB NOT NULL DEFAULT '[]'::jsonb,
                    meta_teams JSONB NOT NULL DEFAULT '[]'::jsonb,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS simulation_jobs (
                    id TEXT PRIMARY KEY,
                    team_id TEXT NOT NULL,
                    team_name TEXT NOT NULL,
                    opponent_mode TEXT NOT NULL,
                    opponent_label TEXT NOT NULL,
                    opponent_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
                    requested_games INTEGER NOT NULL DEFAULT 10,
                    completed_games INTEGER NOT NULL DEFAULT 0,
                    status TEXT NOT NULL DEFAULT 'queued',
                    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
                    error_message TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    started_at TIMESTAMPTZ,
                    completed_at TIMESTAMPTZ,
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )


def serialize_json(value: object) -> str:
    return json.dumps(value)
