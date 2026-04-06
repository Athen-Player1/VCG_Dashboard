from __future__ import annotations

from collections import Counter

from app.models.schemas import (
    AnalysisMetric,
    CoverageCheck,
    RecommendationDetail,
    TeamAnalysisResponse,
    TeamResponse,
    TypePressure,
)

TYPE_CHART: dict[str, dict[str, float]] = {
    "Normal": {"Rock": 0.5, "Ghost": 0.0, "Steel": 0.5},
    "Fire": {
        "Fire": 0.5,
        "Water": 0.5,
        "Grass": 2.0,
        "Ice": 2.0,
        "Bug": 2.0,
        "Rock": 0.5,
        "Dragon": 0.5,
        "Steel": 2.0,
    },
    "Water": {"Fire": 2.0, "Water": 0.5, "Grass": 0.5, "Ground": 2.0, "Rock": 2.0, "Dragon": 0.5},
    "Electric": {"Water": 2.0, "Electric": 0.5, "Grass": 0.5, "Ground": 0.0, "Flying": 2.0, "Dragon": 0.5},
    "Grass": {
        "Fire": 0.5,
        "Water": 2.0,
        "Grass": 0.5,
        "Poison": 0.5,
        "Ground": 2.0,
        "Flying": 0.5,
        "Bug": 0.5,
        "Rock": 2.0,
        "Dragon": 0.5,
        "Steel": 0.5,
    },
    "Ice": {"Fire": 0.5, "Water": 0.5, "Grass": 2.0, "Ground": 2.0, "Flying": 2.0, "Dragon": 2.0, "Steel": 0.5, "Ice": 0.5},
    "Fighting": {
        "Normal": 2.0,
        "Ice": 2.0,
        "Poison": 0.5,
        "Flying": 0.5,
        "Psychic": 0.5,
        "Bug": 0.5,
        "Rock": 2.0,
        "Ghost": 0.0,
        "Dark": 2.0,
        "Steel": 2.0,
        "Fairy": 0.5,
    },
    "Poison": {"Grass": 2.0, "Poison": 0.5, "Ground": 0.5, "Rock": 0.5, "Ghost": 0.5, "Steel": 0.0, "Fairy": 2.0},
    "Ground": {"Fire": 2.0, "Electric": 2.0, "Grass": 0.5, "Poison": 2.0, "Flying": 0.0, "Bug": 0.5, "Rock": 2.0, "Steel": 2.0},
    "Flying": {"Electric": 0.5, "Grass": 2.0, "Fighting": 2.0, "Bug": 2.0, "Rock": 0.5, "Steel": 0.5},
    "Psychic": {"Fighting": 2.0, "Poison": 2.0, "Psychic": 0.5, "Dark": 0.0, "Steel": 0.5},
    "Bug": {
        "Fire": 0.5,
        "Grass": 2.0,
        "Fighting": 0.5,
        "Poison": 0.5,
        "Flying": 0.5,
        "Psychic": 2.0,
        "Ghost": 0.5,
        "Dark": 2.0,
        "Steel": 0.5,
        "Fairy": 0.5,
    },
    "Rock": {"Fire": 2.0, "Ice": 2.0, "Fighting": 0.5, "Ground": 0.5, "Flying": 2.0, "Bug": 2.0, "Steel": 0.5},
    "Ghost": {"Normal": 0.0, "Psychic": 2.0, "Ghost": 2.0, "Dark": 0.5},
    "Dragon": {"Dragon": 2.0, "Steel": 0.5, "Fairy": 0.0},
    "Dark": {"Fighting": 0.5, "Psychic": 2.0, "Ghost": 2.0, "Dark": 0.5, "Fairy": 0.5},
    "Steel": {"Fire": 0.5, "Water": 0.5, "Electric": 0.5, "Ice": 2.0, "Rock": 2.0, "Steel": 0.5, "Fairy": 2.0},
    "Fairy": {"Fire": 0.5, "Fighting": 2.0, "Poison": 0.5, "Dragon": 2.0, "Dark": 2.0, "Steel": 0.5},
}

ALL_TYPES = list(TYPE_CHART.keys())
SPEED_CONTROL_MOVES = {"Tailwind", "Icy Wind", "Electroweb", "Trick Room", "Thunder Wave", "Scary Face", "Bulldoze"}
REDIRECTION_MOVES = {"Follow Me", "Rage Powder"}
PIVOT_MOVES = {"Parting Shot", "U-turn", "Volt Switch", "Flip Turn", "Baton Pass", "Chilly Reception"}
TRICK_ROOM_MOVES = {"Trick Room"}
TAILWIND_MOVES = {"Tailwind"}
WEATHER_MOVES = {
    "Sunny Day": "sun",
    "Rain Dance": "rain",
    "Sandstorm": "sand",
    "Snowscape": "snow",
}
WEATHER_SETTER_ABILITIES = {
    "Drought": "sun",
    "Orichalcum Pulse": "sun",
    "Drizzle": "rain",
    "Sand Stream": "sand",
    "Snow Warning": "snow",
}
WEATHER_PAYOFF_ABILITIES = {
    "Protosynthesis": "sun",
    "Chlorophyll": "sun",
    "Solar Power": "sun",
    "Swift Swim": "rain",
    "Rain Dish": "rain",
    "Sand Rush": "sand",
    "Sand Force": "sand",
    "Slush Rush": "snow",
    "Ice Body": "snow",
}
WEATHER_PAYOFF_MOVES = {
    "Solar Beam": "sun",
    "Solar Blade": "sun",
    "Weather Ball": "sun",
    "Thunder": "rain",
    "Hurricane": "rain",
    "Blizzard": "snow",
    "Aurora Veil": "snow",
}
TERRAIN_SETTER_ABILITIES = {
    "Electric Surge": "electric",
    "Hadron Engine": "electric",
    "Grassy Surge": "grassy",
    "Psychic Surge": "psychic",
    "Misty Surge": "misty",
}
TERRAIN_PAYOFF_ABILITIES = {
    "Quark Drive": "electric",
}
TERRAIN_PAYOFF_MOVES = {
    "Rising Voltage": "electric",
    "Grassy Glide": "grassy",
    "Expanding Force": "psychic",
    "Misty Explosion": "misty",
}
BOOSTER_ITEM = "booster energy"
TRICK_ROOM_PAYOFF_SPECIES = {
    "ursaluna",
    "ursaluna-bloodmoon",
    "bloodmoon ursaluna",
    "torkoal",
    "amoonguss",
    "iron hands",
    "kingambit",
    "cresselia",
}
TRICK_ROOM_PAYOFF_ROLE_KEYWORDS = ("room", "slow", "bulky", "endgame")
WEATHER_LABELS = {
    "sun": "sun",
    "rain": "rain",
    "sand": "sand",
    "snow": "snow",
    "electric": "Electric Terrain",
    "grassy": "Grassy Terrain",
    "psychic": "Psychic Terrain",
    "misty": "Misty Terrain",
}
SPREAD_MOVES = {
    "Heat Wave",
    "Rock Slide",
    "Dazzling Gleam",
    "Hyper Voice",
    "Snarl",
    "Discharge",
    "Earthquake",
    "Precipice Blades",
    "Bleakwind Storm",
    "Muddy Water",
    "Eruption",
    "Make It Rain",
    "Astral Barrage",
    "Glacial Lance",
    "Water Spout",
}


def build_team_analysis(team: TeamResponse) -> TeamAnalysisResponse:
    filled_members = [member for member in team.members if member.name.strip()]
    type_summary = _build_type_summary(filled_members)
    shared_weaknesses = [
        summary for summary in type_summary if summary.weak_count >= 2
    ][:5]
    defensive_benchmarks = [
        summary for summary in type_summary if summary.resist_count + summary.immune_count >= 3
    ][:5]

    control_flags = _extract_flags(filled_members)
    metrics = _build_metrics(filled_members, shared_weaknesses, defensive_benchmarks, control_flags)
    checks = _build_coverage_checks(filled_members, control_flags)
    strengths, warnings, recommendations, recommendation_details = _build_notes(
        filled_members, shared_weaknesses, defensive_benchmarks, control_flags
    )

    return TeamAnalysisResponse(
        team_id=team.id,
        filled_slots=len(filled_members),
        metrics=metrics,
        type_matrix=sorted(type_summary, key=lambda entry: entry.type),
        shared_weaknesses=shared_weaknesses,
        defensive_benchmarks=defensive_benchmarks,
        coverage_checks=checks,
        strengths=strengths,
        warnings=warnings,
        recommendations=recommendations,
        recommendation_details=recommendation_details,
    )


def _build_type_summary(filled_members: list) -> list[TypePressure]:
    summary: list[TypePressure] = []
    for attack_type in ALL_TYPES:
        weak_count = 0
        resist_count = 0
        immune_count = 0
        for member in filled_members:
            defending_types = [member_type.title() for member_type in member.types]
            multiplier = _multiplier(attack_type, defending_types)
            if multiplier == 0:
                immune_count += 1
            elif multiplier > 1:
                weak_count += 1
            elif multiplier < 1:
                resist_count += 1

        summary.append(
            TypePressure(
                type=attack_type,
                weak_count=weak_count,
                resist_count=resist_count,
                immune_count=immune_count,
            )
        )

    return sorted(
        summary,
        key=lambda entry: (
            -entry.weak_count,
            entry.resist_count + entry.immune_count,
            entry.type,
        ),
    )


def _multiplier(attack_type: str, defending_types: list[str]) -> float:
    if not defending_types:
        return 1.0

    multiplier = 1.0
    for defending_type in defending_types[:2]:
        multiplier *= TYPE_CHART.get(attack_type, {}).get(defending_type, 1.0)
    return multiplier


def _extract_flags(filled_members: list) -> dict[str, object]:
    moves = Counter(move for member in filled_members for move in member.moves)
    abilities = Counter(member.ability for member in filled_members if member.ability)
    roles = [member.role.lower() for member in filled_members if member.role]

    weather_setters: Counter[str] = Counter()
    weather_payoffs: Counter[str] = Counter()
    weather_needs_support: Counter[str] = Counter()
    terrain_setters: Counter[str] = Counter()
    terrain_payoffs: Counter[str] = Counter()
    terrain_needs_support: Counter[str] = Counter()
    trick_room_payoff_count = 0

    for member in filled_members:
        ability = member.ability.strip()
        item = member.item.strip().lower()
        role = member.role.lower()
        name = member.name.lower()

        weather = WEATHER_SETTER_ABILITIES.get(ability)
        if weather:
            weather_setters[weather] += 1

        terrain = TERRAIN_SETTER_ABILITIES.get(ability)
        if terrain:
            terrain_setters[terrain] += 1

        weather_payoff = WEATHER_PAYOFF_ABILITIES.get(ability)
        if weather_payoff:
            weather_payoffs[weather_payoff] += 1
            if item != BOOSTER_ITEM:
                weather_needs_support[weather_payoff] += 1

        terrain_payoff = TERRAIN_PAYOFF_ABILITIES.get(ability)
        if terrain_payoff:
            terrain_payoffs[terrain_payoff] += 1
            if item != BOOSTER_ITEM:
                terrain_needs_support[terrain_payoff] += 1

        for move in member.moves:
            if move in WEATHER_MOVES:
                weather_setters[WEATHER_MOVES[move]] += 1
            weather_from_move = WEATHER_PAYOFF_MOVES.get(move)
            if weather_from_move:
                weather_payoffs[weather_from_move] += 1
                weather_needs_support[weather_from_move] += 1

            terrain_from_move = TERRAIN_PAYOFF_MOVES.get(move)
            if terrain_from_move:
                terrain_payoffs[terrain_from_move] += 1
                terrain_needs_support[terrain_from_move] += 1

        if "Trick Room" not in member.moves and (
            any(keyword in role for keyword in TRICK_ROOM_PAYOFF_ROLE_KEYWORDS) or name in TRICK_ROOM_PAYOFF_SPECIES
        ):
            trick_room_payoff_count += 1

    protect_count = sum(1 for member in filled_members if any(move == "Protect" for move in member.moves))
    speed_control_count = sum(1 for move in moves if move in SPEED_CONTROL_MOVES) + sum(
        1 for role in roles if "speed" in role or "tailwind" in role or "trick room" in role
    )
    redirection_count = sum(1 for move in moves if move in REDIRECTION_MOVES)
    fake_out_count = moves.get("Fake Out", 0)
    intimidate_count = abilities.get("Intimidate", 0)
    pivot_count = sum(1 for move in moves if move in PIVOT_MOVES)
    spread_pressure_count = sum(1 for move in moves if move in SPREAD_MOVES)
    tailwind_count = sum(1 for move in moves if move in TAILWIND_MOVES)
    trick_room_count = sum(1 for move in moves if move in TRICK_ROOM_MOVES)
    setup_support_count = sum(1 for move in moves if move in {"Helping Hand", "Coaching", "Taunt", "Encore", "Haze"})

    return {
        "protect_count": protect_count,
        "speed_control_count": speed_control_count,
        "redirection_count": redirection_count,
        "fake_out_count": fake_out_count,
        "intimidate_count": intimidate_count,
        "pivot_count": pivot_count,
        "spread_pressure_count": spread_pressure_count,
        "tailwind_count": tailwind_count,
        "trick_room_count": trick_room_count,
        "trick_room_payoff_count": trick_room_payoff_count,
        "setup_support_count": setup_support_count,
        "weather_setters": weather_setters,
        "weather_payoffs": weather_payoffs,
        "weather_needs_support": weather_needs_support,
        "terrain_setters": terrain_setters,
        "terrain_payoffs": terrain_payoffs,
        "terrain_needs_support": terrain_needs_support,
    }


def _build_metrics(
    filled_members: list,
    shared_weaknesses: list[TypePressure],
    defensive_benchmarks: list[TypePressure],
    flags: dict[str, object],
) -> list[AnalysisMetric]:
    filled_slots = len(filled_members)
    distinct_types = len({member_type.title() for member in filled_members for member_type in member.types})
    distinct_move_count = len({move for member in filled_members for move in member.moves})

    offensive_score = min(
        100,
        30
        + distinct_move_count * 4
        + flags["spread_pressure_count"] * 8
        + sum(flags["weather_payoffs"].values()) * 4
        + sum(flags["terrain_payoffs"].values()) * 4
        + min(20, filled_slots * 4),
    )
    defensive_score = max(
        25,
        80
        + len(defensive_benchmarks) * 4
        - len(shared_weaknesses) * 10
        - max(0, 6 - filled_slots) * 5,
    )
    speed_score = min(
        100,
        25 + flags["speed_control_count"] * 25 + flags["fake_out_count"] * 10 + flags["tailwind_count"] * 6 + flags["trick_room_count"] * 10,
    )
    utility_score = min(
        100,
        20
        + flags["protect_count"] * 8
        + flags["pivot_count"] * 12
        + flags["redirection_count"] * 15
        + flags["intimidate_count"] * 15
        + flags["setup_support_count"] * 6
    )

    return [
        _metric("Offense", offensive_score, f"{distinct_types} defensive types and {distinct_move_count} unique moves logged."),
        _metric("Defense", defensive_score, f"{len(shared_weaknesses)} stacked weakness areas and {len(defensive_benchmarks)} good resist buckets found."),
        _metric("Speed Control", speed_score, f"{flags['speed_control_count']} speed-control signals and {flags['fake_out_count']} Fake Out sources detected."),
        _metric("Utility", utility_score, f"{flags['protect_count']} Protect users plus disruption and pivot tools were counted."),
    ]


def _metric(label: str, score: int, summary: str) -> AnalysisMetric:
    if score >= 90:
        grade = "S"
    elif score >= 80:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 60:
        grade = "C"
    else:
        grade = "D"

    return AnalysisMetric(label=label, score=score, grade=grade, summary=summary)


def _build_coverage_checks(filled_members: list, flags: dict[str, object]) -> list[CoverageCheck]:
    filled_slots = len(filled_members)
    mode_ready = bool(_coherent_modes(flags))
    return [
        CoverageCheck(
            label="Speed control",
            status="ready" if flags["speed_control_count"] > 0 else "thin",
            detail="The team has at least one credible way to manipulate turn order."
            if flags["speed_control_count"] > 0
            else "Add Tailwind, Icy Wind, Trick Room, Thunder Wave, or a stronger speed role.",
        ),
        CoverageCheck(
            label="Protect discipline",
            status="ready" if flags["protect_count"] >= max(2, filled_slots // 2) else "thin",
            detail=f"{flags['protect_count']} members currently carry Protect."
            if flags["protect_count"] > 0
            else "Protect usage is very low for VGC pacing and positioning.",
        ),
        CoverageCheck(
            label="Board control",
            status="ready" if flags["fake_out_count"] or flags["redirection_count"] or flags["intimidate_count"] else "thin",
            detail="The shell has Fake Out, redirection, or Intimidate support."
            if flags["fake_out_count"] or flags["redirection_count"] or flags["intimidate_count"]
            else "Consider adding Fake Out, Rage Powder, Follow Me, or Intimidate support.",
        ),
        CoverageCheck(
            label="Pivoting",
            status="ready" if flags["pivot_count"] > 0 else "thin",
            detail="A pivot move is available for repositioning."
            if flags["pivot_count"] > 0
            else "No pivot move detected yet, so board resets may be awkward.",
        ),
        CoverageCheck(
            label="Mode cohesion",
            status="ready" if mode_ready else "thin",
            detail=_mode_summary(flags)
            if mode_ready
            else "No weather, terrain, or Trick Room package looks fully connected yet.",
        ),
    ]


def _build_notes(
    filled_members: list,
    shared_weaknesses: list[TypePressure],
    defensive_benchmarks: list[TypePressure],
    flags: dict[str, object],
) -> tuple[list[str], list[str], list[str], list[RecommendationDetail]]:
    strengths: list[str] = []
    warnings: list[str] = []
    recommendation_candidates: list[dict[str, object]] = []
    seen_candidates: set[tuple[str, str]] = set()

    def add_recommendation(
        priority: int,
        message: str,
        *,
        category: str,
        severity: str,
        confidence: int,
        evidence: list[str] | None = None,
        affected_members: list[str] | None = None,
        suggested_fix: str | None = None,
    ) -> None:
        key = (category, message)
        if key in seen_candidates:
            return
        seen_candidates.add(key)
        recommendation_candidates.append(
            {
                "priority": priority,
                "summary": message,
                "category": category,
                "severity": severity,
                "confidence": confidence,
                "evidence": evidence or [],
                "affected_members": affected_members or [],
                "suggested_fix": suggested_fix or message,
            }
        )

    if len(filled_members) < 6:
        warnings.append(f"The shell only has {len(filled_members)} filled slots, so analysis depth is limited.")
        add_recommendation(
            120,
            "Finish the remaining slots before trusting matchup planning too heavily.",
            category="builder",
            severity="high",
            confidence=98,
            evidence=[f"Only {len(filled_members)} of 6 slots are filled."],
            suggested_fix="Fill the remaining team slots before leaning on matchup planning or simulation results.",
        )

    if defensive_benchmarks:
        strengths.append(
            f"Best defensive cover currently shows into {', '.join(entry.type for entry in defensive_benchmarks[:3])} pressure."
        )

    if flags["speed_control_count"] > 0:
        strengths.append("The team has at least one visible speed-control line to help stabilize fast matchups.")
    else:
        warnings.append("No clear speed-control tool was detected from moves or assigned roles.")
        add_recommendation(
            96,
            "Add Icy Wind, Tailwind, Trick Room, Thunder Wave, or another committed speed-control plan.",
            category="speed-control",
            severity="high",
            confidence=95,
            evidence=["No recognized speed-control moves or role tags were detected."],
        )

    if flags["fake_out_count"] or flags["redirection_count"] or flags["intimidate_count"]:
        strengths.append("There is already some board-management support through disruption, redirection, or Intimidate.")
    else:
        warnings.append("The team lacks obvious Fake Out, Intimidate, or redirection support.")
        add_recommendation(
            82,
            "Add one stabilizing support axis like Fake Out, Intimidate, or redirection so difficult openings feel less binary.",
            category="support",
            severity="medium",
            confidence=88,
            evidence=["No Fake Out, Intimidate, or redirection support was detected."],
        )

    if shared_weaknesses:
        primary = shared_weaknesses[0]
        support_count = primary.resist_count + primary.immune_count
        affected_members = _members_exposed_to_type(filled_members, primary.type)
        warnings.append(
            f"Stacked defensive pressure shows up most clearly into {', '.join(entry.type for entry in shared_weaknesses[:3])} attacks."
        )
        add_recommendation(
            90 + primary.weak_count * 3 - support_count * 2,
            f"Patch {primary.type} first: {primary.weak_count} members are weak there while only {support_count} currently resist or ignore it.",
            category="defense",
            severity="high" if primary.weak_count >= 3 else "medium",
            confidence=min(98, 70 + primary.weak_count * 8),
            evidence=[
                f"{primary.weak_count} members are weak to {primary.type}.",
                f"{support_count} members currently resist or ignore {primary.type}.",
            ],
            affected_members=affected_members,
            suggested_fix=f"Add another {primary.type} resistance, immunity, or defensive tera plan before relying on this shell into common pressure.",
        )
    else:
        strengths.append("No major multi-member weakness stack showed up in the current type profile.")

    if flags["protect_count"] < max(2, len(filled_members) // 2):
        warnings.append("Protect count is light for a doubles team that wants flexible positioning.")
        add_recommendation(
            74,
            f"Add Protect or Detect to more members unless those slots have a very specific item or role reason not to ({flags['protect_count']} of {len(filled_members)} currently carry it).",
            category="positioning",
            severity="medium",
            confidence=84,
            evidence=[f"{flags['protect_count']} of {len(filled_members)} filled members currently carry Protect or Detect."],
            affected_members=_members_missing_guard(filled_members),
        )
    else:
        strengths.append("Protect usage is healthy enough to support positioning-heavy turns.")

    if flags["spread_pressure_count"] == 0:
        add_recommendation(
            50,
            "Consider adding at least one strong spread attacker to improve closing pressure into standard boards.",
            category="offense",
            severity="low",
            confidence=72,
            evidence=["No recognized spread-pressure move was detected."],
        )
    else:
        strengths.append("The team already shows at least one spread-damage option for board compression.")

    _append_mode_notes(strengths, warnings, recommendation_candidates, seen_candidates, flags)

    if flags["speed_control_count"] == 1 and len(filled_members) >= 5:
        add_recommendation(
            68,
            "Add a second speed-control line so one piece being pressured does not collapse your turn-order plan.",
            category="speed-control",
            severity="medium",
            confidence=82,
            evidence=["Only one primary speed-control signal was detected across the current six."],
        )

    if flags["pivot_count"] == 0:
        add_recommendation(
            44,
            "Consider one pivot tool like Parting Shot, U-turn, Volt Switch, or Flip Turn to make reset turns less committal.",
            category="positioning",
            severity="low",
            confidence=70,
            evidence=["No pivot move was detected."],
        )

    if not recommendation_candidates:
        add_recommendation(
            10,
            "The shell looks structurally sound enough to move into matchup-specific planning next.",
            category="next-step",
            severity="low",
            confidence=76,
            evidence=["No major structural red flag outranked the current strengths."],
        )

    recommendation_candidates.sort(key=lambda item: (-int(item["priority"]), str(item["summary"])))
    top_candidates = recommendation_candidates[:4]
    recommendations = [str(item["summary"]) for item in top_candidates]
    recommendation_details = [
        RecommendationDetail(
            summary=str(item["summary"]),
            category=str(item["category"]),
            severity=str(item["severity"]),
            confidence=int(item["confidence"]),
            evidence=[str(entry) for entry in item["evidence"]],
            affectedMembers=[str(entry) for entry in item["affected_members"]],
            suggestedFix=str(item["suggested_fix"]),
        )
        for item in top_candidates
    ]
    return strengths[:4], warnings[:4], recommendations, recommendation_details


def _append_mode_notes(
    strengths: list[str],
    warnings: list[str],
    recommendation_candidates: list[dict[str, object]],
    seen_candidates: set[tuple[str, str]],
    flags: dict[str, object],
) -> None:
    def add_recommendation(
        priority: int,
        message: str,
        *,
        category: str,
        severity: str,
        confidence: int,
        evidence: list[str] | None = None,
        suggested_fix: str | None = None,
    ) -> None:
        key = (category, message)
        if key in seen_candidates:
            return
        seen_candidates.add(key)
        recommendation_candidates.append(
            {
                "priority": priority,
                "summary": message,
                "category": category,
                "severity": severity,
                "confidence": confidence,
                "evidence": evidence or [],
                "affected_members": [],
                "suggested_fix": suggested_fix or message,
            }
        )

    for weather, setter_count in flags["weather_setters"].items():
        payoff_count = flags["weather_payoffs"].get(weather, 0)
        if payoff_count > 0:
            strengths.append(
                f"The team shows a connected {WEATHER_LABELS[weather]} package with {setter_count} setter(s) and {payoff_count} payoff piece(s)."
            )
        else:
            warnings.append(f"{WEATHER_LABELS[weather].title()} is enabled, but the roster shows little direct payoff for it yet.")
            add_recommendation(
                78,
                f"Either lean harder into {WEATHER_LABELS[weather]} with stronger payoffs or free that slot for a more generally useful support piece.",
                category="mode",
                severity="medium",
                confidence=84,
                evidence=[f"{setter_count} setter(s) found for {WEATHER_LABELS[weather]} but no clear payoff piece was detected."],
            )

    for weather, payoff_count in flags["weather_needs_support"].items():
        if flags["weather_setters"].get(weather, 0) > 0:
            continue
        warnings.append(f"The team has {WEATHER_LABELS[weather]} payoffs without a reliable setter.")
        add_recommendation(
            84,
            f"Add a reliable {WEATHER_LABELS[weather]} setter or replace the weather-dependent payoff pieces so the mode stops floating.",
            category="mode",
            severity="high",
            confidence=90,
            evidence=[f"{payoff_count} {WEATHER_LABELS[weather]} payoff piece(s) were detected without a matching setter."],
        )

    for terrain, setter_count in flags["terrain_setters"].items():
        payoff_count = flags["terrain_payoffs"].get(terrain, 0)
        if payoff_count > 0:
            strengths.append(
                f"{WEATHER_LABELS[terrain]} support is present with {setter_count} setter(s) and {payoff_count} clear payoff piece(s)."
            )
        else:
            warnings.append(f"{WEATHER_LABELS[terrain]} is turned on, but the roster is not exploiting it much yet.")
            add_recommendation(
                70,
                f"If you keep {WEATHER_LABELS[terrain]}, add clearer payoffs so the field effect creates an actual advantage instead of just incidental value.",
                category="mode",
                severity="medium",
                confidence=80,
                evidence=[f"{setter_count} setter(s) found for {WEATHER_LABELS[terrain]} but no clear payoff piece was detected."],
            )

    for terrain, payoff_count in flags["terrain_needs_support"].items():
        if flags["terrain_setters"].get(terrain, 0) > 0:
            continue
        warnings.append(f"The team has {WEATHER_LABELS[terrain]} payoffs without a dependable setter.")
        add_recommendation(
            80,
            f"Add a dependable {WEATHER_LABELS[terrain]} setter or trim the unsupported payoff pieces so the team is not split between plans.",
            category="mode",
            severity="medium",
            confidence=86,
            evidence=[f"{payoff_count} {WEATHER_LABELS[terrain]} payoff piece(s) were detected without a matching setter."],
        )

    if flags["trick_room_count"] > 0 and flags["trick_room_payoff_count"] > 0:
        strengths.append(
            f"Trick Room is backed by {flags['trick_room_payoff_count']} likely slow-mode payoff piece(s), so the reverse-speed line looks intentional."
        )
    elif flags["trick_room_count"] > 0:
        warnings.append("Trick Room is present, but the roster does not show many obvious slow-mode payoffs.")
        add_recommendation(
            76,
            "If Trick Room is part of the identity, add clearer slow-mode payoffs so setting it actually swings the game state.",
            category="mode",
            severity="medium",
            confidence=82,
            evidence=["Trick Room was detected, but few obvious slow-mode payoff pieces were found."],
        )
    elif flags["trick_room_payoff_count"] >= 2:
        warnings.append("Several members look like Trick Room payoffs, but no reliable setter was detected.")
        add_recommendation(
            88,
            "Add a dedicated Trick Room setter or rebalance the slow pieces so the team is not waiting on a mode it cannot consistently enable.",
            category="mode",
            severity="high",
            confidence=92,
            evidence=[f"{flags['trick_room_payoff_count']} likely Trick Room payoff pieces were detected without a setter."],
        )

    if flags["weather_setters"] and flags["terrain_setters"]:
        add_recommendation(
            58,
            "Sanity-check that the weather and terrain packages are supporting the same win condition; if not, trim one mode so the team previews more cleanly.",
            category="mode",
            severity="low",
            confidence=68,
            evidence=["Both weather and terrain setters are present, which can signal split mode identity."],
        )


def _coherent_modes(flags: dict[str, object]) -> list[str]:
    modes: list[str] = []
    for weather, setter_count in flags["weather_setters"].items():
        if setter_count and flags["weather_payoffs"].get(weather, 0):
            modes.append(WEATHER_LABELS[weather])

    for terrain, setter_count in flags["terrain_setters"].items():
        if setter_count and flags["terrain_payoffs"].get(terrain, 0):
            modes.append(WEATHER_LABELS[terrain])

    if flags["trick_room_count"] and flags["trick_room_payoff_count"]:
        modes.append("Trick Room")

    return modes


def _mode_summary(flags: dict[str, object]) -> str:
    modes = _coherent_modes(flags)
    if modes:
        return f"Detected coherent mode packages: {', '.join(modes[:3])}."
    return "No weather, terrain, or Trick Room package looks fully connected yet."


def _members_exposed_to_type(filled_members: list, attack_type: str) -> list[str]:
    exposed: list[str] = []
    for member in filled_members:
        defending_types = [member_type.title() for member_type in member.types]
        if _multiplier(attack_type, defending_types) > 1:
            exposed.append(member.name)
    return exposed


def _members_missing_guard(filled_members: list) -> list[str]:
    return [
        member.name
        for member in filled_members
        if "Protect" not in member.moves and "Detect" not in member.moves
    ]
