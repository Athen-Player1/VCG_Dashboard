export type PokemonSlot = {
  name: string;
  item: string;
  ability: string;
  types: string[];
  moves: string[];
  role: string;
  teraType?: string;
  image: string;
};

export type Team = {
  id: string;
  name: string;
  format: string;
  archetype: string;
  elo?: number;
  notes: string;
  tags: string[];
  members: PokemonSlot[];
};

export type Threat = {
  name: string;
  threatLevel: "High" | "Medium" | "Low";
  reason: string;
  counterplay: string;
};

export type MetaTeam = {
  id: string;
  name: string;
  format: string;
  archetype: string;
  core: string[];
  pressurePoints: string[];
  plan: string[];
};

export type DashboardData = {
  activeFormat: string;
  teams: Team[];
  threats: Threat[];
  weaknessSummary: string[];
  recommendations: string[];
  metaTeams: MetaTeam[];
};

export type AnalysisMetric = {
  label: string;
  score: number;
  grade: string;
  summary: string;
};

export type TypePressure = {
  type: string;
  weak_count: number;
  resist_count: number;
  immune_count: number;
};

export type CoverageCheck = {
  label: string;
  status: string;
  detail: string;
};

export type TeamAnalysis = {
  team_id: string;
  filled_slots: number;
  metrics: AnalysisMetric[];
  shared_weaknesses: TypePressure[];
  defensive_benchmarks: TypePressure[];
  coverage_checks: CoverageCheck[];
  strengths: string[];
  warnings: string[];
  recommendations: string[];
};
