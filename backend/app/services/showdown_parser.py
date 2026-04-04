from app.models.schemas import ShowdownPokemon


STAT_MAP = {
    "HP": "hp",
    "Atk": "atk",
    "Def": "def",
    "SpA": "spa",
    "SpD": "spd",
    "Spe": "spe",
}


def _parse_stat_line(value: str) -> dict[str, int]:
    stats: dict[str, int] = {}
    for segment in value.split("/"):
        raw = segment.strip()
        if not raw:
            continue
        parts = raw.split(" ")
        if len(parts) < 2:
            continue
        stat_value = int(parts[0])
        stat_name = STAT_MAP.get(parts[1])
        if stat_name:
            stats[stat_name] = stat_value
    return stats


def parse_showdown_team(showdown_text: str) -> list[ShowdownPokemon]:
    sections = [section.strip() for section in showdown_text.strip().split("\n\n") if section.strip()]
    parsed: list[ShowdownPokemon] = []

    for section in sections:
        lines = [line.strip() for line in section.splitlines() if line.strip()]
        if not lines:
            continue

        header = lines[0]
        name = header.split(" @ ")[0].strip()
        item = header.split(" @ ")[1].strip() if " @ " in header else None
        pokemon = ShowdownPokemon(name=name, item=item)

        for line in lines[1:]:
            if line.startswith("Ability:"):
                pokemon.ability = line.replace("Ability:", "", 1).strip()
            elif line.startswith("Tera Type:"):
                pokemon.tera_type = line.replace("Tera Type:", "", 1).strip()
            elif line.startswith("EVs:"):
                pokemon.evs = _parse_stat_line(line.replace("EVs:", "", 1).strip())
            elif line.startswith("IVs:"):
                pokemon.ivs = _parse_stat_line(line.replace("IVs:", "", 1).strip())
            elif line.endswith(" Nature"):
                pokemon.nature = line.replace(" Nature", "").strip()
            elif line.startswith("- "):
                pokemon.moves.append(line.replace("- ", "", 1).strip())

        parsed.append(pokemon)

    return parsed
