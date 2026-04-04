import { PokemonSlot } from "./types";

const SPECIAL_IMAGE_SLUGS: Record<string, string> = {
  "Ogerpon-W": "ogerpon-wellspring",
  "Bloodmoon Ursaluna": "ursaluna-bloodmoon",
  Landorus: "landorus-therian"
};

export function slugifyPokemonSpecies(name: string): string {
  const trimmed = name.trim();

  if (SPECIAL_IMAGE_SLUGS[trimmed]) {
    return SPECIAL_IMAGE_SLUGS[trimmed];
  }

  return trimmed
    .toLowerCase()
    .replaceAll(".", "")
    .replaceAll("'", "")
    .replaceAll("♀", "-f")
    .replaceAll("♂", "-m")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPokemonImageUrl(name: string): string {
  const slug = slugifyPokemonSpecies(name);
  if (!slug) {
    return "";
  }

  return `https://img.pokemondb.net/sprites/scarlet-violet/normal/${slug}.png`;
}

export function normalizePokemonSlot(member: PokemonSlot): PokemonSlot {
  return {
    ...member,
    name: member.name.trim(),
    item: member.item.trim(),
    ability: member.ability.trim(),
    role: member.role.trim(),
    teraType: member.teraType?.trim() || "",
    types: member.types.map((type) => type.trim()).filter(Boolean),
    moves: member.moves.map((move) => move.trim()).filter(Boolean),
    image: member.image?.trim() || getPokemonImageUrl(member.name)
  };
}
