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


class AnalysisMetric(BaseModel):
    label: str
    score: int
    grade: str
    summary: str


class TypePressure(BaseModel):
    type: str
    weak_count: int
    resist_count: int
    immune_count: int


class CoverageCheck(BaseModel):
    label: str
    status: str
    detail: str


class TeamAnalysisResponse(BaseModel):
    team_id: str
    filled_slots: int
    metrics: list[AnalysisMetric] = Field(default_factory=list)
    type_matrix: list[TypePressure] = Field(default_factory=list)
    shared_weaknesses: list[TypePressure] = Field(default_factory=list)
    defensive_benchmarks: list[TypePressure] = Field(default_factory=list)
    coverage_checks: list[CoverageCheck] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


class ThreatResponse(BaseModel):
    name: str
    threatLevel: str
    reason: str
    counterplay: str


class MetaTeamResponse(BaseModel):
    id: str
    name: str
    format: str
    archetype: str
    core: list[str] = Field(default_factory=list)
    pressurePoints: list[str] = Field(default_factory=list)
    plan: list[str] = Field(default_factory=list)


class MetaSnapshotResponse(BaseModel):
    id: str
    format: str
    source: str
    snapshotDate: str
    active: bool
    weaknessSummary: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    threats: list[ThreatResponse] = Field(default_factory=list)
    metaTeams: list[MetaTeamResponse] = Field(default_factory=list)


class MetaSnapshotCreateRequest(BaseModel):
    id: str = Field(min_length=1, max_length=120)
    format: str = Field(min_length=1, max_length=120)
    source: str = Field(min_length=1, max_length=120)
    snapshotDate: str = Field(min_length=10, max_length=10)
    active: bool = False
    weaknessSummary: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    threats: list[ThreatResponse] = Field(default_factory=list)
    metaTeams: list[MetaTeamResponse] = Field(default_factory=list)


class MatchupSummaryResponse(BaseModel):
    meta_team_id: str
    meta_team_name: str
    danger_level: str
    overview: str
    focus_points: list[str] = Field(default_factory=list)
    suggested_leads: list[str] = Field(default_factory=list)
    preserve_targets: list[str] = Field(default_factory=list)
    win_conditions: list[str] = Field(default_factory=list)
    tera_notes: list[str] = Field(default_factory=list)
    game_plan: list[str] = Field(default_factory=list)
    danger_points: list[str] = Field(default_factory=list)
    danger_checklist: list[str] = Field(default_factory=list)
