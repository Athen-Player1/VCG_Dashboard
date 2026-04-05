import {
  ArchetypeMatchup,
  DashboardData,
  MatchupSummary,
  MetaSnapshot,
  PokemonSlot,
  SimulationJob,
  ShowdownValidation,
  Team,
  TeamAnalysis
} from "./types";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function getDashboardData(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load dashboard data");
  }

  return response.json();
}

export async function getTeams(): Promise<Team[]> {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load teams");
  }

  return response.json();
}

export async function getTeam(teamId: string): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load team");
  }

  return response.json();
}

export async function getTeamAnalysis(teamId: string): Promise<TeamAnalysis> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/analysis`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load team analysis");
  }

  return response.json();
}

export async function getActiveMetaSnapshot(): Promise<MetaSnapshot> {
  const response = await fetch(`${API_BASE_URL}/meta/snapshots/active`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load active meta snapshot");
  }

  return response.json();
}

export async function getTeamMetaMatchups(teamId: string): Promise<MatchupSummary[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/meta-matchups`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load team meta matchups");
  }

  return response.json();
}

export async function getTeamArchetypeMatchups(teamId: string): Promise<ArchetypeMatchup[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/archetype-matchups`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load team archetype matchups");
  }

  return response.json();
}

export async function getMetaSnapshots(): Promise<MetaSnapshot[]> {
  const response = await fetch(`${API_BASE_URL}/meta/snapshots`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load meta snapshots");
  }

  return response.json();
}

export async function createMetaSnapshot(payload: MetaSnapshot): Promise<MetaSnapshot> {
  const response = await fetch(`${API_BASE_URL}/meta/snapshots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to create meta snapshot");
  }

  return response.json();
}

export async function activateMetaSnapshot(snapshotId: string): Promise<MetaSnapshot> {
  const response = await fetch(`${API_BASE_URL}/meta/snapshots/${snapshotId}/activate`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to activate meta snapshot");
  }

  return response.json();
}

export async function importVictoryRoadSnapshot(payload: {
  url: string;
  format: string;
  snapshotDate?: string;
  active: boolean;
}): Promise<MetaSnapshot> {
  const response = await fetch(`${API_BASE_URL}/meta/import/victory-road`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to import Victory Road snapshot");
  }

  return response.json();
}

type TeamMutationPayload = {
  name: string;
  format: string;
  archetype: string;
  notes: string;
  tags: string[];
  members: PokemonSlot[];
};

export async function createTeam(payload: TeamMutationPayload): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to create team");
  }

  return response.json();
}

export async function updateTeam(teamId: string, payload: TeamMutationPayload): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to update team");
  }

  return response.json();
}

export async function deleteTeam(teamId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Failed to delete team");
  }
}

export async function getSimulationJobs(): Promise<SimulationJob[]> {
  const response = await fetch(`${API_BASE_URL}/simulation/jobs`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load simulation jobs");
  }

  return response.json();
}

export async function createSimulationJob(payload: {
  teamId: string;
  opponentMode: "top_meta" | "input_team";
  requestedGames: number;
  showdownText?: string;
}): Promise<SimulationJob> {
  const response = await fetch(`${API_BASE_URL}/simulation/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to create simulation job");
  }

  return response.json();
}

export async function validateShowdownTeam(payload: {
  format: string;
  showdownText?: string;
  members?: PokemonSlot[];
}): Promise<ShowdownValidation> {
  const response = await fetch(`${API_BASE_URL}/teams/showdown-check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to validate team with Showdown");
  }

  return response.json();
}
