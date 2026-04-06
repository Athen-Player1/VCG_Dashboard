from app.models.schemas import ShowdownPokemon
from app.services.victory_road_import import (
    _build_threat_counterplay,
    _build_member_from_showdown,
    _extract_vr_paste_id,
)


def test_extract_vr_paste_id_from_url() -> None:
    assert _extract_vr_paste_id("https://vrpastes.com/qmF3TCgV") == "qmF3TCgV"


def test_build_member_from_showdown_keeps_core_fields() -> None:
    member = _build_member_from_showdown(
        ShowdownPokemon(
            name="Urshifu-Rapid-Strike",
            item="Focus Sash",
            ability="Unseen Fist",
            moves=["Detect", "Surging Strikes", "Close Combat", "Aqua Jet"],
            tera_type="Water",
        )
    )

    assert member["name"] == "Urshifu-Rapid-Strike"
    assert member["item"] == "Focus Sash"
    assert member["ability"] == "Unseen Fist"
    assert member["teraType"] == "Water"
    assert member["moves"][0] == "Detect"
    assert member["image"].endswith("/urshifu-rapid-strike.png")


def test_build_threat_counterplay_for_landorus_is_actionable() -> None:
    counterplay = _build_threat_counterplay("Landorus Incarnate")

    assert "Ground plan" in counterplay
    assert "Water, Grass, or Ice" in counterplay


def test_build_threat_counterplay_fallback_mentions_tempo_sequence() -> None:
    counterplay = _build_threat_counterplay("Iron Valiant")

    assert "Iron Valiant" in counterplay
    assert "first two turns" in counterplay
