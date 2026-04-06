from app.models.schemas import TeamMember, TeamResponse
from app.services.team_analysis import build_team_analysis
from app.services.victory_road_import import _build_recommendations


def _member(
    name: str,
    *,
    item: str = "",
    ability: str = "",
    types: list[str] | None = None,
    moves: list[str] | None = None,
    role: str = "",
    tera_type: str | None = None,
) -> TeamMember:
    return TeamMember(
        name=name,
        item=item,
        ability=ability,
        types=types or [],
        moves=moves or [],
        role=role,
        teraType=tera_type,
        image="",
    )


def test_team_analysis_marks_coherent_sun_mode_ready() -> None:
    team = TeamResponse(
        id="sun-mode",
        name="Sun Mode",
        format="Regulation H",
        archetype="Sun",
        notes="",
        members=[
            _member("Torkoal", item="Charcoal", ability="Drought", types=["Fire"], moves=["Eruption", "Protect"], role="Sun setter"),
            _member("Flutter Mane", item="Focus Sash", ability="Protosynthesis", types=["Ghost", "Fairy"], moves=["Moonblast", "Icy Wind", "Protect"], role="Speed control"),
            _member("Lilligant", item="Focus Sash", ability="Chlorophyll", types=["Grass"], moves=["Sleep Powder", "After You", "Leaf Storm", "Protect"], role="Sun support"),
            _member("Incineroar", item="Sitrus Berry", ability="Intimidate", types=["Fire", "Dark"], moves=["Fake Out", "Parting Shot", "Flare Blitz", "Knock Off"], role="Pivot"),
            _member("Ogerpon-W", item="Wellspring Mask", ability="Water Absorb", types=["Grass", "Water"], moves=["Ivy Cudgel", "Follow Me", "Spiky Shield", "Horn Leech"], role="Support"),
            _member("Landorus-Therian", item="Choice Scarf", ability="Intimidate", types=["Ground", "Flying"], moves=["Stomping Tantrum", "U-turn", "Rock Slide", "Tera Blast"], role="Pivot"),
        ],
    )

    analysis = build_team_analysis(team)

    mode_check = next(check for check in analysis.coverage_checks if check.label == "Mode cohesion")
    assert mode_check.status == "ready"
    assert "sun" in mode_check.detail.lower()
    assert not any("reliable sun setter" in item for item in analysis.recommendations)
    assert analysis.recommendation_details
    assert all(detail.summary for detail in analysis.recommendation_details)
    assert all(detail.severity in {"high", "medium", "low"} for detail in analysis.recommendation_details)


def test_team_analysis_flags_unsupported_weather_payoffs() -> None:
    team = TeamResponse(
        id="floating-rain",
        name="Floating Rain",
        format="Regulation H",
        archetype="Balance",
        notes="",
        members=[
            _member("Zapdos", item="Safety Goggles", ability="Pressure", types=["Electric", "Flying"], moves=["Thunder", "Tailwind", "Protect", "Heat Wave"], role="Speed control"),
            _member("Ludicolo", item="Assault Vest", ability="Swift Swim", types=["Water", "Grass"], moves=["Fake Out", "Muddy Water", "Giga Drain", "Ice Beam"], role="Rain payoff"),
            _member("Incineroar", item="Sitrus Berry", ability="Intimidate", types=["Fire", "Dark"], moves=["Fake Out", "Parting Shot", "Flare Blitz", "Knock Off"], role="Pivot"),
            _member("Amoonguss", item="Rocky Helmet", ability="Regenerator", types=["Grass", "Poison"], moves=["Rage Powder", "Spore", "Pollen Puff", "Protect"], role="Support"),
            _member("Garchomp", item="Clear Amulet", ability="Rough Skin", types=["Dragon", "Ground"], moves=["Stomping Tantrum", "Protect", "Dragon Claw", "Rock Slide"], role="Breaker"),
            _member("Gholdengo", item="Leftovers", ability="Good as Gold", types=["Steel", "Ghost"], moves=["Make It Rain", "Shadow Ball", "Protect", "Nasty Plot"], role="Special breaker"),
        ],
    )

    analysis = build_team_analysis(team)

    assert any("reliable rain setter" in item for item in analysis.recommendations)
    assert any("rain payoffs without a reliable setter" in item for item in analysis.warnings)
    assert any(detail.category == "mode" for detail in analysis.recommendation_details)
    assert any("rain" in detail.summary.lower() for detail in analysis.recommendation_details)


def test_team_analysis_rain_shell_does_not_create_fake_sun_mode_from_weather_ball() -> None:
    team = TeamResponse(
        id="clean-rain",
        name="Clean Rain",
        format="Regulation H",
        archetype="Rain",
        notes="",
        members=[
            _member("Pelipper", item="Damp Rock", ability="Drizzle", types=["Water", "Flying"], moves=["Weather Ball", "Hurricane", "U-turn", "Protect"], role="Rain setter"),
            _member("Ludicolo", item="Life Orb", ability="Swift Swim", types=["Water", "Grass"], moves=["Hydro Pump", "Ice Beam", "Energy Ball", "Protect"], role="Rain payoff"),
            _member("Kingdra", item="Choice Specs", ability="Swift Swim", types=["Water", "Dragon"], moves=["Hydro Pump", "Draco Meteor", "Surf", "Ice Beam"], role="Rain payoff"),
            _member("Floatzel", item="Choice Band", ability="Swift Swim", types=["Water"], moves=["Waterfall", "Aqua Jet", "Ice Spinner", "Crunch"], role="Rain payoff"),
            _member("Jolteon", item="Assault Vest", ability="Volt Absorb", types=["Electric"], moves=["Thunder", "Rain Dance", "Shadow Ball", "Alluring Voice"], role="Rain support"),
            _member("Swampert", item="Mystic Water", ability="Damp", types=["Water", "Ground"], moves=["Waterfall", "Earthquake", "Ice Punch", "Protect"], role="Breaker"),
        ],
    )

    analysis = build_team_analysis(team)

    mode_check = next(check for check in analysis.coverage_checks if check.label == "Mode cohesion")
    assert mode_check.status == "ready"
    assert "rain" in mode_check.detail.lower()
    assert not any("reliable sun setter" in item.lower() for item in analysis.recommendations)
    assert not any("sun" in item.lower() for item in analysis.warnings)


def test_victory_road_recommendations_reflect_common_modes() -> None:
    rows = [
        {"player": "A", "record": "8-1", "team": ["Torkoal", "Lilligant", "Farigiraf", "Ursaluna-Bloodmoon", "Incineroar", "Amoonguss"], "ots": ""},
        {"player": "B", "record": "8-2", "team": ["Koraidon", "Flutter Mane", "Walking Wake", "Incineroar", "Rillaboom", "Ogerpon-W"], "ots": ""},
        {"player": "C", "record": "7-2", "team": ["Farigiraf", "Torkoal", "Amoonguss", "Iron Hands", "Ursaluna-Bloodmoon", "Pelipper"], "ots": ""},
    ]

    recommendations = _build_recommendations(rows)

    assert any("trick room" in item.lower() or "sun mode" in item.lower() for item in recommendations)
