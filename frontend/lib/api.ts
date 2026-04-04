import { DashboardData, PokemonSlot, Team, TeamAnalysis } from "./types";

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
