import { ArchetypeMatchupPanel } from "@/components/archetype-matchup-panel";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MatchupSummaryPanel } from "@/components/matchup-summary-panel";
import { SnapshotManagementPanel } from "@/components/snapshot-management-panel";
import {
  loadActiveMetaSnapshot,
  loadTeamArchetypeMatchups,
  loadDashboardData,
  loadMetaSnapshots,
  loadTeamById,
  loadTeamMetaMatchups
} from "@/lib/dashboard-data";

export default async function MetaPage({
  searchParams
}: {
  searchParams?: Promise<{ team?: string }>;
}) {
  const data = await loadDashboardData();
  const params = (await searchParams) ?? {};
  const activeSnapshot = await loadActiveMetaSnapshot();
  const snapshots = await loadMetaSnapshots();
  const selectedTeamId = params.team;
  const selectedTeam = selectedTeamId ? await loadTeamById(selectedTeamId) : undefined;
  const matchupSummaries =
    selectedTeamId && selectedTeam ? await loadTeamMetaMatchups(selectedTeamId) : undefined;
  const archetypeMatchups =
    selectedTeamId && selectedTeam ? await loadTeamArchetypeMatchups(selectedTeamId) : undefined;
  const metaData = activeSnapshot ?? {
    id: "fallback",
    format: data.activeFormat,
    source: "Dashboard fallback",
    snapshotDate: "Unknown",
    active: true,
    weaknessSummary: data.weaknessSummary,
    recommendations: data.recommendations,
    threats: data.threats,
    metaTeams: data.metaTeams
  };

  return (
    <AppShell
      activeSection="meta"
      pageNavigation={
        selectedTeam
          ? [
              {
                href: `/meta?team=${selectedTeam.id}#team-matchups`,
                label: `${selectedTeam.name} Matchups`,
                icon: "strategy"
              },
              {
                href: `/meta?team=${selectedTeam.id}#archetype-plans`,
                label: "Archetype Plans",
                icon: "group_work"
              }
            ]
          : []
      }
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
            Format Snapshot
          </div>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
            Meta Trends
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[var(--on-surface-variant)]">
            Review the active stored snapshot, identify pressure points, and move from format
            context into matchup planning.
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[1.5rem] bg-white p-8 shadow-sm">
            <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
              Active Snapshot
            </div>
            <h2 className="mt-2 font-headline text-2xl font-bold">{metaData.format}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[var(--surface-container-low)] p-4">
                <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Source
                </div>
                <p className="mt-2 text-sm font-semibold">{metaData.source}</p>
              </div>
              <div className="rounded-2xl bg-[var(--surface-container-low)] p-4">
                <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Snapshot Date
                </div>
                <p className="mt-2 text-sm font-semibold">{metaData.snapshotDate}</p>
              </div>
            </div>
            {selectedTeam ? (
              <div className="mt-6 rounded-2xl bg-[var(--secondary-fixed)]/60 p-4">
                <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--secondary)]">
                  Comparison Focus
                </div>
                <p className="mt-2 text-sm font-semibold text-[var(--on-surface)]">
                  You are currently viewing the meta through the lens of {selectedTeam.name}.
                </p>
                <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                  This is the right place to start once the team&apos;s structural analysis looks
                  stable.
                </p>
              </div>
            ) : null}
          </article>

          <article id="snapshot-guidance" className="rounded-[1.5rem] bg-white p-8 shadow-sm">
            <h2 className="font-headline text-2xl font-bold">Snapshot Guidance</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {metaData.recommendations.map((item) => (
                <div key={item} className="rounded-2xl bg-[var(--surface-container-low)] p-4">
                  <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                    Action
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {!selectedTeam ? (
          <section className="rounded-[1.5rem] bg-white p-8 shadow-sm">
            <h2 className="font-headline text-2xl font-bold">Pick a saved team for comparison</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--on-surface-variant)]">
              Meta snapshots are loaded and ready, but matchup summaries become much more useful once you select a saved team. Start with a blank shell or import one from Showdown if this is a fresh workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white"
                href="/teams?compose=1"
              >
                Create First Team
              </Link>
              <Link
                className="rounded-2xl bg-[var(--secondary-fixed)] px-5 py-3 font-headline text-sm font-bold text-[var(--secondary)]"
                href="/teams#import-lab"
              >
                Import Team
              </Link>
            </div>
          </section>
        ) : null}

        <div id="team-matchups">
          {selectedTeam && matchupSummaries ? (
            <MatchupSummaryPanel matchups={matchupSummaries} teamName={selectedTeam.name} />
          ) : null}
        </div>

        <div id="archetype-plans">
          {selectedTeam && archetypeMatchups ? (
            <ArchetypeMatchupPanel matchups={archetypeMatchups} teamName={selectedTeam.name} />
          ) : null}
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          {metaData.metaTeams.map((metaTeam) => (
            <article id={metaTeam.id} key={metaTeam.id} className="rounded-[1.5rem] bg-white p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline text-2xl font-bold">{metaTeam.name}</h2>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    {metaTeam.format} • {metaTeam.archetype}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[var(--primary)]">strategy</span>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                    Core
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6">{metaTeam.core.join(" / ")}</p>
                </div>
                <div>
                  <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                    Pressure Points
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                    {metaTeam.pressurePoints.join(", ")}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Suggested Plan
                </div>
                <div className="mt-3 space-y-3">
                  {metaTeam.plan.map((step) => (
                    <div key={step} className="rounded-xl bg-[var(--surface-container-low)] px-4 py-3 text-sm leading-6 text-[var(--on-surface-variant)]">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[1.5rem] bg-white p-8 shadow-sm">
          <h2 className="font-headline text-2xl font-bold">Threat Radar</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {metaData.threats.map((threat) => (
              <article key={threat.name} className="rounded-[1.25rem] bg-[var(--surface-container-low)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-headline text-lg font-bold">{threat.name}</h3>
                  <span className="rounded-full bg-white px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                    {threat.threatLevel}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">{threat.reason}</p>
                <p className="mt-3 text-sm font-semibold text-[var(--secondary)]">{threat.counterplay}</p>
              </article>
            ))}
          </div>
        </section>

        <SnapshotManagementPanel snapshots={snapshots} />
      </div>
    </AppShell>
  );
}
