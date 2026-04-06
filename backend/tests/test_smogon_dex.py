import json

from app.services.smogon_dex import get_smogon_set, search_pokemon


class _FakeResponse:
    def __init__(self, text: str, status_code: int = 200) -> None:
        self.text = text
        self.status_code = status_code


def _html_with_dex_settings(payload: dict) -> str:
    return f"<script>dexSettings = {json.dumps(payload)}</script>"


def test_search_pokemon_reads_species_index(monkeypatch) -> None:
    payload = {
        "injectRpcs": [
            ['["dump-gens",{}]', []],
            ['["dump-basics",{"gen":"sv"}]', {"pokemon": [
                {"name": "Pelipper", "types": ["Water", "Flying"], "formats": ["VGC25 Regulation I"]},
                {"name": "Politoed", "types": ["Water"], "formats": ["VGC"]},
                {"name": "Pikachu", "types": ["Electric"], "formats": []},
            ]}],
        ]
    }

    monkeypatch.setattr(
        "app.services.smogon_dex.requests.get",
        lambda *args, **kwargs: _FakeResponse(_html_with_dex_settings(payload)),
    )
    search_pokemon.cache_clear() if hasattr(search_pokemon, "cache_clear") else None
    from app.services import smogon_dex
    smogon_dex._load_species_index.cache_clear()

    results = search_pokemon("peli")

    assert results
    assert results[0].name == "Pelipper"
    assert results[0].smogonSetAvailable is True


def test_get_smogon_set_selects_latest_vgc_strategy(monkeypatch) -> None:
    basics_payload = {
        "injectRpcs": [
            ['["dump-gens",{}]', []],
            ['["dump-basics",{"gen":"sv"}]', {"pokemon": [
                {"name": "Pelipper", "types": ["Water", "Flying"], "formats": ["VGC25 Regulation I"]},
            ]}],
        ]
    }
    pelipper_payload = {
        "injectRpcs": [
            ['["dump-gens",{}]', []],
            ['["dump-basics",{"gen":"sv"}]', {}],
            ['["dump-pokemon",{"alias":"pelipper","gen":"sv","language":"en"}]', {
                "strategies": [
                    {"format": "VGC24 Regulation G", "movesets": [{"name": "Older Set", "items": ["Sitrus Berry"], "abilities": ["Drizzle"], "moveslots": [[{"move": "Hurricane"}]], "natures": ["Bold"], "teratypes": ["Water"]}]},
                    {"format": "VGC25 Regulation I", "movesets": [{"name": "Current Set", "items": ["Damp Rock"], "abilities": ["Drizzle"], "moveslots": [[{"move": "Hurricane"}], [{"move": "Tailwind"}], [{"move": "Protect"}], [{"move": "Wide Guard"}]], "natures": ["Bold"], "teratypes": ["Ghost"]}]},
                ]
            }],
        ]
    }

    def fake_get(url: str, *args, **kwargs):
        if url.endswith("/dex/sv/pokemon/"):
            return _FakeResponse(_html_with_dex_settings(basics_payload))
        return _FakeResponse(_html_with_dex_settings(pelipper_payload))

    monkeypatch.setattr("app.services.smogon_dex.requests.get", fake_get)
    from app.services import smogon_dex
    smogon_dex._load_species_index.cache_clear()
    smogon_dex._load_pokemon_page.cache_clear()

    result = get_smogon_set("Pelipper")

    assert result.species == "Pelipper"
    assert result.format == "VGC25 Regulation I"
    assert result.setName == "Current Set"
    assert result.item == "Damp Rock"
    assert result.moves == ["Hurricane", "Tailwind", "Protect", "Wide Guard"]
    assert result.types == ["Water", "Flying"]
