import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { TeamAnalysisPanel } from "@/components/team-analysis-panel";
import { loadDashboardData, loadTeamAnalysis } from "@/lib/dashboard-data";

export default async function AnalysisPage({
  searchParams
}: {
  searchParams?: Promise<{ team?: string }>;
}) {
  const data = await loadDashboardData();
  const params = (await searchParams) ?? {};
  const selectedTeamId =
    params.team && data.teams.some((team) => team.id === params.team)
      ? params.team
      : data.teams[0]?.id;
  const selectedTeam = data.teams.find((team) => team.id === selectedTeamId);
  const selectedAnalysis = selectedTeamId ? await loadTeamAnalysis(selectedTeamId) : undefined;

  return (
    <AppShell activeSection="analysis">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
            Analysis Desk
          </div>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
            Team Analysis
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[var(--on-surface-variant)]">
            Review saved teams through the same structural analysis engine used in the builder,
            then branch into meta work once the shell looks stable.
          </p>
        </div>

        <section id="team-picker" className="rounded-[1.5rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-headline text-2xl font-bold">Choose a Saved Team</h2>
              <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                The analysis desk always stays tied to one saved team so recommendations remain
                explainable.
              </p>
            </div>
            {selectedTeam ? (
              <div className="rounded-full bg-[var(--surface-container-low)] px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--outline)]">
                Active: {selectedTeam.name}
              </div>
            ) : null}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.teams.map((team) => {
              const active = team.id === selectedTeamId;

              return (
                <Link
                  key={team.id}
                  className={`rounded-[1.25rem] border p-5 transition-all ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary-fixed)]/35 shadow-sm"
                      : "border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:bg-white"
                  }`}
                  href={`/analysis?team=${team.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-headline text-lg font-bold">{team.name}</div>
                      <div className="mt-2 text-sm text-[var(--on-surface-variant)]">
                        {team.format} • {team.archetype}
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                      {team.members.length} mons
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--on-surface-variant)]">
                    {team.notes}
                  </p>
                </Link>
              );
            })}
          </div>
          {data.teams.length === 0 ? (
            <div className="mt-6 rounded-[1.25rem] bg-[var(--surface-container-low)] p-6">
              <h3 className="font-headline text-xl font-bold">No saved teams yet</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">
                Create a blank team shell or import a Showdown export first. The analysis desk stays tied to saved teams so recommendations remain explainable.
              </p>
              <Link
                className="mt-5 inline-flex rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white"
                href="/teams?compose=1"
              >
                Create First Team
              </Link>
            </div>
          ) : null}
        </section>

        <div id="structural-readout">
          {selectedAnalysis ? <TeamAnalysisPanel analysis={selectedAnalysis} /> : null}
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article id="format-radar" className="rounded-[1.5rem] bg-white p-8 shadow-sm">
            <h2 className="font-headline text-2xl font-bold">Format Radar</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {data.weaknessSummary.map((item) => (
                <div key={item} className="rounded-2xl bg-[var(--surface-container-low)] p-4">
                  <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                    Snapshot Note
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article id="threat-radar" className="rounded-[1.5rem] bg-white p-8 shadow-sm">
            <h2 className="font-headline text-2xl font-bold">Threat Radar</h2>
            <div className="mt-6 space-y-3">
              {data.threats.map((threat) => (
                <article
                  key={threat.name}
                  className="rounded-[1.25rem] bg-[var(--surface-container-low)] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-headline text-lg font-bold">{threat.name}</h3>
                    <span className="rounded-full bg-white px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                      {threat.threatLevel}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">
                    {threat.reason}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[var(--secondary)]">
                    {threat.counterplay}
                  </p>
                </article>
              ))}
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
