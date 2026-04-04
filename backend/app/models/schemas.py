from pydantic import BaseModel, Field


class ShowdownImportRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    format: str = Field(min_length=1, max_length=80)
    showdown_text: str = Field(min_length=1)


class ShowdownPokemon(BaseModel):
    name: str
    item: str | None = None
    ability: str | None = None
    moves: list[str] = Field(default_factory=list)
    nature: str | None = None
    tera_type: str | None = None
    evs: dict[str, int] = Field(default_factory=dict)
    ivs: dict[str, int] = Field(default_factory=dict)


class ShowdownImportResponse(BaseModel):
    team_name: str
    format: str
    pokemon: list[ShowdownPokemon]
