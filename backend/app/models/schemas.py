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


class TeamMember(BaseModel):
    name: str
    item: str
    ability: str
    types: list[str] = Field(default_factory=list)
    moves: list[str] = Field(default_factory=list)
    role: str
    teraType: str | None = None
    image: str


class TeamMemberInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    item: str = Field(default="")
    ability: str = Field(default="")
    types: list[str] = Field(default_factory=list)
    moves: list[str] = Field(default_factory=list)
    role: str = Field(default="")
    teraType: str | None = None
    image: str | None = None


class TeamResponse(BaseModel):
    id: str
    name: str
    format: str
    archetype: str
    elo: int | None = None
    notes: str
    tags: list[str] = Field(default_factory=list)
    members: list[TeamMember] = Field(default_factory=list)


class TeamCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    format: str = Field(min_length=1, max_length=80)
    archetype: str = Field(min_length=1, max_length=80)
    notes: str = Field(default="")
    tags: list[str] = Field(default_factory=list)
    members: list[TeamMemberInput] = Field(default_factory=list)


class TeamUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    format: str = Field(min_length=1, max_length=80)
    archetype: str = Field(min_length=1, max_length=80)
    notes: str = Field(default="")
    tags: list[str] = Field(default_factory=list)
    members: list[TeamMemberInput] = Field(default_factory=list)
