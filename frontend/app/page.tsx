import { AppShell } from "@/components/app-shell";
import { DashboardShell } from "@/components/dashboard-shell";
import { loadDashboardData } from "@/lib/dashboard-data";

export default async function HomePage() {
  const data = await loadDashboardData();

  return (
    <AppShell activeSection="dashboard">
      <DashboardShell data={data} />
    </AppShell>
  );
}
