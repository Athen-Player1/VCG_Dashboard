import { DashboardData } from "./types";

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
