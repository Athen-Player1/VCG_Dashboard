from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from datetime import date
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException

from app.models.schemas import MetaSnapshotCreateRequest, ShowdownPokemon, VictoryRoadImportRequest
from app.services.meta_store import activate_meta_snapshot, create_meta_snapshot, list_meta_snapshots
from app.services.showdown_parser import parse_showdown_team

VRPASTES_API_URL = "https://vrpaste-backend.vercel.app/api/paste/{paste_id}?lang=english"
VICTORY_ROAD_CALENDAR_URL = "https://victoryroad.pro/2026-season-calendar/"

MONTH_MAP = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}


@dataclass(frozen=True)
class CalendarEvent:
    title: str
    url: str
    start_date: date
    end_date: date
    winner: str
    regulation: str


def import_victory_road_snapshot(payload: VictoryRoadImportRequest) -> dict:
    html = _fetch_html(payload.url)
    soup = BeautifulSoup(html, "html.parser")

    title = _extract_title(soup)
    imported_rows = _extract_top_cut_rows(soup)
    if not imported_rows:
        raise HTTPException(status_code=422, detail="No tournament rows found on the provided Victory Road page")

    snapshot_date = payload.snapshotDate or _extract_snapshot_date(soup) or date.today().isoformat()
    snapshot_id = _build_snapshot_id(title, snapshot_date)
    source = f"Victory Road import from {payload.url}"

    threats = _build_threats(imported_rows)
    meta_teams = _build_meta_teams(imported_rows, payload.format)
    weakness_summary = _build_weakness_summary(imported_rows)
    recommendations = _build_recommendations(imported_rows)

    snapshot_payload = MetaSnapshotCreateRequest(
        id=snapshot_id,
        format=payload.format,
        source=source,
        snapshotDate=snapshot_date,
        active=payload.active,
        weaknessSummary=weakness_summary,
        recommendations=recommendations,
        threats=threats,
        metaTeams=meta_teams,
    )

    return create_meta_snapshot(snapshot_payload)


def sync_latest_regulation_snapshot(today: date | None = None) -> dict | None:
    latest_event = _discover_latest_regulation_event(today=today)
    if latest_event is None:
        return None

    snapshot_date = latest_event.end_date.isoformat()
    snapshot_id = _build_snapshot_id(latest_event.title, snapshot_date)
    existing = next(
        (snapshot for snapshot in list_meta_snapshots() if snapshot["id"] == snapshot_id),
        None,
    )

    if existing is not None:
        if not existing["active"]:
            return activate_meta_snapshot(snapshot_id)
        return existing

    return import_victory_road_snapshot(
        VictoryRoadImportRequest(
            url=latest_event.url,
            format=f"{latest_event.regulation} Snapshot",
            snapshotDate=snapshot_date,
            active=True,
        )
    )


def _fetch_html(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="Only http and https URLs are supported")

    response = requests.get(
        url,
        timeout=30,
        headers={"User-Agent": "VGC-Dashboard/1.0 meta snapshot importer"},
    )
    response.raise_for_status()
    return response.text


def _extract_title(soup: BeautifulSoup) -> str:
    for selector in ["h1.entry-title", "h1", "title"]:
        node = soup.select_one(selector)
        if node and node.get_text(strip=True):
            return node.get_text(strip=True)
    return "Victory Road Event"


def _extract_snapshot_date(soup: BeautifulSoup) -> str | None:
    time_tag = soup.find("time")
    if time_tag:
        datetime_value = time_tag.get("datetime")
        if datetime_value:
            return datetime_value[:10]
    return None


def _discover_latest_regulation_event(today: date | None = None) -> CalendarEvent | None:
    reference_day = today or date.today()
    soup = BeautifulSoup(_fetch_html(VICTORY_ROAD_CALENDAR_URL), "html.parser")
    events = _extract_calendar_events(soup)
    if not events:
        return None

    current_regulation = _infer_current_regulation(events, reference_day)
    if not current_regulation:
        return None

    eligible = [
        event
        for event in events
        if event.regulation == current_regulation
        and event.end_date <= reference_day
        and _has_reported_result(event.winner)
    ]
    if not eligible:
        return None

    return max(eligible, key=lambda event: (event.end_date, event.start_date, event.title))


def _extract_calendar_events(soup: BeautifulSoup) -> list[CalendarEvent]:
    events: list[CalendarEvent] = []

    for row in soup.select("table tr"):
        columns = row.find_all("td")
        if len(columns) < 4:
            continue

        event_link = columns[1].find("a", href=True)
        if event_link is None:
            continue
        parsed_url = urlparse(event_link["href"])
        if not parsed_url.netloc.endswith("victoryroad.pro"):
            continue

        parsed_dates = _parse_calendar_dates(columns[0].get_text(" ", strip=True))
        regulation = _extract_regulation_label(columns[3].get_text(" ", strip=True))
        if parsed_dates is None or regulation is None:
            continue

        events.append(
            CalendarEvent(
                title=event_link.get_text(" ", strip=True),
                url=event_link["href"],
                start_date=parsed_dates[0],
                end_date=parsed_dates[1],
                winner=columns[2].get_text(" ", strip=True),
                regulation=regulation,
            )
        )

    return events


def _parse_calendar_dates(value: str) -> tuple[date, date] | None:
    normalized = value.replace("\xa0", " ").replace("–", "-")

    patterns = [
        r"^(?P<start_day>\d{1,2})-(?P<end_day>\d{1,2}) (?P<month>[A-Za-z]{3}) (?P<year>\d{4})$",
        r"^(?P<start_day>\d{1,2}) (?P<start_month>[A-Za-z]{3})-(?P<end_day>\d{1,2}) (?P<end_month>[A-Za-z]{3}) (?P<year>\d{4})$",
        r"^(?P<day>\d{1,2}) (?P<month>[A-Za-z]{3}) (?P<year>\d{4})$",
    ]

    for pattern in patterns:
        match = re.match(pattern, normalized)
        if not match:
            continue

        groups = match.groupdict()
        year = int(groups["year"])
        if groups.get("day"):
            month = _month_number(groups["month"])
            day = int(groups["day"])
            single_date = date(year, month, day)
            return single_date, single_date

        start_month = _month_number(groups.get("start_month") or groups["month"])
        end_month = _month_number(groups.get("end_month") or groups["month"])
        start_day = int(groups["start_day"])
        end_day = int(groups["end_day"])
        return date(year, start_month, start_day), date(year, end_month, end_day)

    return None


def _month_number(value: str) -> int:
    month = MONTH_MAP.get(value.strip().lower()[:3])
    if month is None:
        raise ValueError(f"Unknown month: {value}")
    return month


def _extract_regulation_label(value: str) -> str | None:
    match = re.search(r"(Reg(?:ulation)?\.?\s*Set\s*[A-Z](?:-[A-Z])?)", value, flags=re.IGNORECASE)
    if not match:
        return None

    label = match.group(1)
    label = label.replace("Reg.", "Regulation").replace("Reg ", "Regulation ")
    return re.sub(r"\s+", " ", label).strip()


def _infer_current_regulation(events: list[CalendarEvent], today: date) -> str | None:
    ongoing = [event for event in events if event.start_date <= today <= event.end_date]
    if ongoing:
        return min(ongoing, key=lambda event: event.end_date).regulation

    upcoming = [event for event in events if event.start_date >= today]
    if upcoming:
        return min(upcoming, key=lambda event: event.start_date).regulation

    completed = [event for event in events if event.end_date <= today]
    if completed:
        return max(completed, key=lambda event: event.end_date).regulation

    return None


def _has_reported_result(value: str) -> bool:
    normalized = value.strip().lower()
    if not normalized:
        return False

    blockers = ("all info", "sign-ups", "pre-registrations", "tbd", "ongoing")
    return not any(blocker in normalized for blocker in blockers)


def _extract_top_cut_rows(soup: BeautifulSoup) -> list[dict]:
    table = soup.select_one("table.infobox2")
    if table is None:
        return []

    rows: list[dict] = []
    for row in table.select("tbody tr"):
        columns = row.find_all("td")
        if len(columns) < 6:
            continue

        player = columns[3].get_text(" ", strip=True)
        record = columns[1].get_text(" ", strip=True)
        team_column = columns[5]
        team = [
            image.get("title", "").strip()
            for image in team_column.find_all("img")
            if image.get("title")
        ]
        ots_link = ""
        if len(columns) > 6:
            link = columns[6].find("a")
            if link and link.get("href"):
                ots_link = link["href"]

        if not player or not team:
            continue

        rows.append({"player": player, "record": record, "team": team, "ots": ots_link})

    return rows


def _build_snapshot_id(title: str, snapshot_date: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    slug = re.sub(r"-+", "-", slug)
    return f"{slug[:80]}-{snapshot_date}"


def _build_threats(rows: list[dict]) -> list[dict]:
    usage = Counter(mon for row in rows for mon in row["team"])
    total_rows = max(len(rows), 1)
    threats: list[dict] = []
    for name, count in usage.most_common(5):
        if count / total_rows >= 0.75:
            level = "High"
        elif count / total_rows >= 0.4:
            level = "Medium"
        else:
            level = "Low"

        threats.append(
            {
                "name": name,
                "threatLevel": level,
                "reason": f"{name} appeared on {count} of {total_rows} imported top-cut teams.",
                "counterplay": f"Prepare a tested line for {name} before trusting this snapshot in matchup planning.",
            }
        )

    return threats


def _build_meta_teams(rows: list[dict], format_name: str) -> list[dict]:
    teams: list[dict] = []
    for index, row in enumerate(rows[:8], start=1):
        core = row["team"][:4]
        pressure_points = _infer_pressure_points(row["team"])
        ots_data = _fetch_vr_paste(row["ots"]) if row["ots"] else None
        plan = [
            f"Expect {row['player']} to lean on {' / '.join(core[:2])} as the first positioning engine.",
            f"Respect the published OTS line before committing your defensive tera. OTS: {row['ots'] or 'not available'}",
            f"Start prep by testing your default lead into {' / '.join(core[:2])}.",
        ]
        teams.append(
            {
                "id": f"vr-{index}-{_slugify(row['player'])}",
                "name": row["player"],
                "format": format_name,
                "archetype": _infer_archetype(row["team"]),
                "core": core,
                "pressurePoints": pressure_points,
                "plan": plan,
                "members": ots_data["members"] if ots_data else [],
                "showdownText": ots_data["showdownText"] if ots_data else None,
                "otsUrl": row["ots"] or None,
            }
        )
    return teams


def _build_weakness_summary(rows: list[dict]) -> list[str]:
    usage = Counter(mon for row in rows for mon in row["team"])
    common = [name for name, _ in usage.most_common(3)]
    pressure_counts = Counter(point for row in rows for point in _infer_pressure_points(row["team"]))
    top_pressure = [name for name, _ in pressure_counts.most_common(2)]
    return [
        f"Imported snapshot built from {len(rows)} top-cut teams.",
        f"Most common Pokemon in this event snapshot: {', '.join(common)}." if common else "No common-Pokemon note available.",
        f"Most repeated pressure themes were {', '.join(top_pressure)}." if top_pressure else "No repeated pressure-theme note available.",
        "Use this as a dated event snapshot rather than a universal ladder truth.",
        "If the event OTS links are present, matchup planning can key off published tournament teams instead of guesses.",
    ]


def _build_recommendations(rows: list[dict]) -> list[str]:
    top_row = rows[0]
    lead_core = " / ".join(top_row["team"][:2])
    pressure_counts = Counter(point for row in rows for point in _infer_pressure_points(row["team"]))
    top_pressures = [name for name, _ in pressure_counts.most_common(2)]
    archetype_counts = Counter(_infer_archetype(row["team"]) for row in rows)
    top_archetype, top_archetype_count = archetype_counts.most_common(1)[0]

    recommendations = [
        f"Start prep by testing your main lead into the winning core of {lead_core}.",
        f"Bias your first gauntlet toward {top_archetype.lower()} teams first; they made up {top_archetype_count} of {len(rows)} imported finishes.",
    ]

    if top_pressures:
        recommendations.append(
            f"Build dedicated plans for the most repeated pressure themes here: {', '.join(top_pressures)}."
        )
    else:
        recommendations.append("Focus your first matchup plans on the most repeated cores rather than every fringe top-cut team equally.")

    recommendations.append("Re-import fresh event pages as the format evolves so dated snapshots stay explicit.")

    return recommendations[:4]


def _infer_pressure_points(team: list[str]) -> list[str]:
    names = {name.lower() for name in team}
    points: list[str] = []
    if {"incineroar", "rillaboom"} & names:
        points.append("pivot attrition")
    if {"landorus therian", "landorus"} & names:
        points.append("ground spread pressure")
    if {"flutter mane", "calyrex shadow rider", "calyrex-shadow"} & names:
        points.append("fast special pressure")
    if {"farigiraf", "ursaluna bloodmoon", "torkoal"} & names:
        points.append("trick room endgames")
    if {"urshifu rapid", "urshifu-rapid-strike", "ogerpon wellspring", "ogerpon-w"} & names:
        points.append("water pressure")
    if {"koraidon", "torkoal", "walking wake", "lilligant", "lilligant-hisui"} & names:
        points.append("sun mode")
    if {"pelipper", "kyogre", "archaludon", "basculegion", "basculegion-f"} & names:
        points.append("rain mode")
    if {"tyranitar", "excadrill", "garchomp"} & names:
        points.append("sand pressure")
    if {"ninetales-alola", "abomasnow", "baxcalibur"} & names:
        points.append("snow pace")
    if {"miraidon", "iron hands", "iron bundle", "iron crown", "raging bolt"} & names:
        points.append("electric terrain tempo")
    if {"indeedee", "indeedee-f", "armarouge", "deoxys-attack"} & names:
        points.append("psychic terrain burst")
    if not points:
        points.append("high-level open team sheet pressure")
    return points


def _infer_archetype(team: list[str]) -> str:
    joined = " ".join(name.lower() for name in team)
    if "farigiraf" in joined or "bloodmoon" in joined or "torkoal" in joined:
        return "Trick Room"
    if "pelipper" in joined or "kyogre" in joined or "archaludon" in joined:
        return "Rain"
    if "koraidon" in joined or "groudon" in joined or "torkoal" in joined:
        return "Sun"
    if "miraidon" in joined or "iron crown" in joined or "iron bundle" in joined:
        return "Electric Terrain offense"
    return "Tournament balance"


def _slugify(value: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value.lower())).strip("-")


def _fetch_vr_paste(url: str) -> dict | None:
    if "pokepast.es" in url:
        return _fetch_pokepaste(url)

    paste_id = _extract_vr_paste_id(url)
    if not paste_id:
        return None

    response = requests.get(
        VRPASTES_API_URL.format(paste_id=paste_id),
        timeout=30,
        headers={"User-Agent": "VGC-Dashboard/1.0 meta snapshot importer"},
    )
    if response.status_code >= 400:
        return None

    try:
        payload = response.json()
    except ValueError:
        return None

    teams = payload.get("teams", [])
    if not teams:
        return None

    members = [_build_member_from_vr_paste(team) for team in teams]
    showdown_text = _build_showdown_export(teams)
    return {"members": members, "showdownText": showdown_text}


def _fetch_pokepaste(url: str) -> dict | None:
    response = requests.get(
        f"{url.rstrip('/')}/raw",
        timeout=30,
        headers={"User-Agent": "VGC-Dashboard/1.0 meta snapshot importer"},
    )
    if response.status_code >= 400:
        return None

    showdown_text = response.text.replace("\r", "").strip()
    if not showdown_text:
        return None

    parsed_team = parse_showdown_team(showdown_text)
    if not parsed_team:
        return None

    members = [_build_member_from_showdown(member) for member in parsed_team]
    return {"members": members, "showdownText": showdown_text}


def _extract_vr_paste_id(url: str) -> str | None:
    match = re.search(r"vrpastes\.com/([A-Za-z0-9]+)", url)
    return match.group(1) if match else None


def _build_member_from_vr_paste(team: dict) -> dict:
    image_slug = team.get("image", "")
    image = (
        f"https://img.pokemondb.net/sprites/scarlet-violet/normal/{image_slug}.png"
        if image_slug
        else ""
    )
    types = [team.get("type1", "").strip(), team.get("type2", "").strip()]
    return {
        "name": team.get("species") or team.get("name") or "",
        "item": team.get("item", "") or "",
        "ability": team.get("ability", "") or "",
        "types": [item for item in types if item],
        "moves": [move for move in team.get("moves", []) if move],
        "role": "Imported OTS set",
        "teraType": team.get("teraType") or None,
        "image": image,
    }


def _build_showdown_export(teams: list[dict]) -> str:
    sections: list[str] = []
    for team in teams:
        name = team.get("species") or team.get("name") or ""
        if not name:
            continue
        header = name
        item = team.get("item", "")
        if item:
            header = f"{header} @ {item}"
        lines = [header]
        ability = team.get("ability", "")
        if ability:
            lines.append(f"Ability: {ability}")
        tera_type = team.get("teraType", "")
        if tera_type:
            lines.append(f"Tera Type: {tera_type}")
        for move in team.get("moves", [])[:4]:
            lines.append(f"- {move}")
        sections.append("\n".join(lines))
    return "\n\n".join(sections)


def _build_member_from_showdown(team: ShowdownPokemon) -> dict:
    normalized_name = team.name
    image_slug = _normalize_image_slug(normalized_name)
    image = (
        f"https://img.pokemondb.net/sprites/scarlet-violet/normal/{image_slug}.png"
        if image_slug
        else ""
    )
    return {
        "name": normalized_name,
        "item": team.item or "",
        "ability": team.ability or "",
        "types": team.types or [],
        "moves": [move for move in team.moves if move],
        "role": "Imported OTS set",
        "teraType": team.tera_type or None,
        "image": image,
    }


def _normalize_image_slug(name: str) -> str:
    return (
        name.lower()
        .replace("’", "")
        .replace("'", "")
        .replace(" ", "-")
        .replace(".", "")
    )
