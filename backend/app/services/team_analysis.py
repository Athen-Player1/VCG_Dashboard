from __future__ import annotations

from collections import Counter

from app.models.schemas import (
    AnalysisMetric,
    CoverageCheck,
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
    strengths, warnings, recommendations = _build_notes(
        filled_members, shared_weaknesses, defensive_benchmarks, control_flags
    )

    return TeamAnalysisResponse(
        team_id=team.id,
        filled_slots=len(filled_members),
        metrics=metrics,
        shared_weaknesses=shared_weaknesses,
        defensive_benchmarks=defensive_benchmarks,
        coverage_checks=checks,
        strengths=strengths,
        warnings=warnings,
        recommendations=recommendations,
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


def _extract_flags(filled_members: list) -> dict[str, int]:
    moves = Counter(move for member in filled_members for move in member.moves)
    abilities = Counter(member.ability for member in filled_members if member.ability)
    roles = [member.role.lower() for member in filled_members if member.role]

    protect_count = sum(1 for member in filled_members if any(move == "Protect" for move in member.moves))
    speed_control_count = sum(1 for move in moves if move in SPEED_CONTROL_MOVES) + sum(
        1 for role in roles if "speed" in role or "tailwind" in role or "trick room" in role
    )
    redirection_count = sum(1 for move in moves if move in REDIRECTION_MOVES)
    fake_out_count = moves.get("Fake Out", 0)
    intimidate_count = abilities.get("Intimidate", 0)
    pivot_count = sum(1 for move in moves if move in PIVOT_MOVES)
    spread_pressure_count = sum(1 for move in moves if move in SPREAD_MOVES)

    return {
        "protect_count": protect_count,
        "speed_control_count": speed_control_count,
        "redirection_count": redirection_count,
        "fake_out_count": fake_out_count,
        "intimidate_count": intimidate_count,
        "pivot_count": pivot_count,
        "spread_pressure_count": spread_pressure_count,
    }


def _build_metrics(
    filled_members: list,
    shared_weaknesses: list[TypePressure],
    defensive_benchmarks: list[TypePressure],
    flags: dict[str, int],
) -> list[AnalysisMetric]:
    filled_slots = len(filled_members)
    distinct_types = len({member_type.title() for member in filled_members for member_type in member.types})
    distinct_move_count = len({move for member in filled_members for move in member.moves})

    offensive_score = min(
        100,
        30
        + distinct_move_count * 4
        + flags["spread_pressure_count"] * 8
        + min(20, filled_slots * 4),
    )
    defensive_score = max(
        25,
        80
        + len(defensive_benchmarks) * 4
        - len(shared_weaknesses) * 10
        - max(0, 6 - filled_slots) * 5,
    )
    speed_score = min(100, 25 + flags["speed_control_count"] * 25 + flags["fake_out_count"] * 10)
    utility_score = min(
        100,
        20
        + flags["protect_count"] * 8
        + flags["pivot_count"] * 12
        + flags["redirection_count"] * 15
        + flags["intimidate_count"] * 15,
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


def _build_coverage_checks(filled_members: list, flags: dict[str, int]) -> list[CoverageCheck]:
    filled_slots = len(filled_members)
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
    ]


def _build_notes(
    filled_members: list,
    shared_weaknesses: list[TypePressure],
    defensive_benchmarks: list[TypePressure],
    flags: dict[str, int],
) -> tuple[list[str], list[str], list[str]]:
    strengths: list[str] = []
    warnings: list[str] = []
    recommendations: list[str] = []

    if len(filled_members) < 6:
        warnings.append(f"The shell only has {len(filled_members)} filled slots, so analysis depth is limited.")
        recommendations.append("Finish the remaining slots before trusting matchup planning too heavily.")

    if defensive_benchmarks:
        strengths.append(
            f"Best defensive cover currently shows into {', '.join(entry.type for entry in defensive_benchmarks[:3])} pressure."
        )

    if flags["speed_control_count"] > 0:
        strengths.append("The team has at least one visible speed-control line to help stabilize fast matchups.")
    else:
        warnings.append("No clear speed-control tool was detected from moves or assigned roles.")
        recommendations.append("Add Icy Wind, Tailwind, Trick Room, Thunder Wave, or another committed speed-control plan.")

    if flags["fake_out_count"] or flags["redirection_count"] or flags["intimidate_count"]:
        strengths.append("There is already some board-management support through disruption, redirection, or Intimidate.")
    else:
        warnings.append("The team lacks obvious Fake Out, Intimidate, or redirection support.")
        recommendations.append("Consider adding one stabilizing support axis so difficult openings feel less binary.")

    if shared_weaknesses:
        warnings.append(
            f"Stacked defensive pressure shows up most clearly into {', '.join(entry.type for entry in shared_weaknesses[:3])} attacks."
        )
        primary = shared_weaknesses[0]
        recommendations.append(
            f"Patch the {primary.type} matchup with a stronger resistance, immunity, or tera plan before meta comparison work."
        )
    else:
        strengths.append("No major multi-member weakness stack showed up in the current type profile.")

    if flags["protect_count"] < max(2, len(filled_members) // 2):
        warnings.append("Protect count is light for a doubles team that wants flexible positioning.")
        recommendations.append("Add Protect to more members unless those slots have a very specific item or role reason not to.")
    else:
        strengths.append("Protect usage is healthy enough to support positioning-heavy turns.")

    if flags["spread_pressure_count"] == 0:
        recommendations.append("Consider adding at least one strong spread attacker to improve closing pressure into standard boards.")
    else:
        strengths.append("The team already shows at least one spread-damage option for board compression.")

    if not recommendations:
        recommendations.append("The shell looks structurally sound enough to move into matchup-specific planning next.")

    return strengths[:4], warnings[:4], recommendations[:4]
