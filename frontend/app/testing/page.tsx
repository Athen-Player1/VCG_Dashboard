import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SimulationControlPanel } from "@/components/simulation-control-panel";
import {
  loadActiveMetaSnapshot,
  loadDashboardData,
  loadSimulationJobs
} from "@/lib/dashboard-data";
import { getTeams } from "@/lib/api";

export default async function TestingPage() {
  const [teams, jobs, activeSnapshot, dashboard] = await Promise.all([
    getTeams().catch(() => []),
    loadSimulationJobs(),
    loadActiveMetaSnapshot(),
    loadDashboardData()
  ]);
  const topMetaTeam = activeSnapshot?.metaTeams[0];

  return (
    <AppShell activeSection="testing">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
            Background Worker
          </div>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
            Testing and Simulation
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[var(--on-surface-variant)]">
            Run repeatable 10-game sim batches in the background so the app can surface observed
            weakness patterns instead of only theory.
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
              Active Snapshot
            </div>
            <h2 className="mt-2 font-headline text-2xl font-bold">
              {activeSnapshot?.format ?? dashboard.activeFormat}
            </h2>
            <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
              {activeSnapshot?.source ?? "Using fallback dashboard data because the active snapshot was unavailable."}
            </p>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
              Top Meta Target
            </div>
            <h2 className="mt-2 font-headline text-2xl font-bold">
              {topMetaTeam?.name ?? "No top meta team loaded"}
            </h2>
            <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
              {topMetaTeam
                ? `${topMetaTeam.archetype} • ${topMetaTeam.core.join(" / ")}`
                : "Import or activate a snapshot on the Meta page to drive top-team simulation."}
            </p>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
              Team Pool
            </div>
            <h2 className="mt-2 font-headline text-2xl font-bold">{teams.length}</h2>
            <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
              Saved teams are available to queue into background sims immediately.
            </p>
          </article>
        </section>

        {teams.length > 0 ? (
          <SimulationControlPanel
            activeSnapshot={activeSnapshot}
            jobs={jobs}
            teams={teams}
          />
        ) : (
          <section className="rounded-[1.5rem] bg-white p-8 shadow-sm">
            <h2 className="font-headline text-2xl font-bold">No Saved Teams Yet</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--on-surface-variant)]">
              The simulation lane needs at least one saved team. Import a Showdown export or build a
              new six-slot shell first, then come back here to queue 10-game runs.
            </p>
            <Link
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white"
              href="/teams"
            >
              Open Teams
            </Link>
          </section>
        )}
      </div>
    </AppShell>
  );
}
