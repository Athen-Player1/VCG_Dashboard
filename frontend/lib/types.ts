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

export type TeamThreatPlan = {
  threat: string;
  plan: string;
};

export type TeamPlaybook = {
  defaultPlan: string;
  pilotNotes: string;
  threatPlans: TeamThreatPlan[];
};

export type Team = {
  id: string;
  name: string;
  format: string;
  archetype: string;
  elo?: number;
  notes: string;
  playbook: TeamPlaybook;
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

export type MetaSnapshot = {
  id: string;
  format: string;
  source: string;
  snapshotDate: string;
  active: boolean;
  weaknessSummary: string[];
  recommendations: string[];
  threats: Threat[];
  metaTeams: MetaTeam[];
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

export type RecommendationDetail = {
  summary: string;
  category: string;
  severity: "high" | "medium" | "low";
  confidence: number;
  evidence: string[];
  affectedMembers: string[];
  suggestedFix: string;
};

export type TeamAnalysis = {
  team_id: string;
  filled_slots: number;
  metrics: AnalysisMetric[];
  type_matrix: TypePressure[];
  shared_weaknesses: TypePressure[];
  defensive_benchmarks: TypePressure[];
  coverage_checks: CoverageCheck[];
  strengths: string[];
  warnings: string[];
  recommendations: string[];
  recommendation_details: RecommendationDetail[];
};

export type MatchupSummary = {
  meta_team_id: string;
  meta_team_name: string;
  danger_level: string;
  overview: string;
  focus_points: string[];
  suggested_leads: string[];
  preserve_targets: string[];
  win_conditions: string[];
  tera_notes: string[];
  game_plan: string[];
  danger_points: string[];
  danger_checklist: string[];
};

export type ArchetypeMatchup = {
  archetype: string;
  team_count: number;
  representative_teams: string[];
  overview: string;
  focus_points: string[];
  suggested_leads: string[];
  game_plan: string[];
};

export type SimulationJob = {
  id: string;
  teamId: string;
  teamName: string;
  opponentMode: "top_meta" | "input_team";
  opponentLabel: string;
  requestedGames: number;
  completedGames: number;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  summary: {
    teamName?: string;
    opponentLabel?: string;
    gamesRequested?: number;
    wins?: number;
    losses?: number;
    winRate?: number;
    topThreats?: string[];
    repeatedIssues?: string[];
    recommendations?: string[];
    sampleGames?: Array<{
      game: number;
      result: "win" | "loss";
      note: string;
    }>;
    simulationEngine?: string;
    engineNote?: string;
  };
  errorMessage?: string | null;
};

export type ShowdownValidation = {
  formatRequested: string;
  formatResolved: string;
  valid: boolean;
  issues: string[];
  packedTeam: string;
  exportedTeam: string;
  pokemon: Array<{
    name: string;
    item?: string | null;
    ability?: string | null;
    moves: string[];
    nature?: string | null;
    tera_type?: string | null;
  }>;
};
