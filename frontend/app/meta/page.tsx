import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { loadDashboardData } from "@/lib/dashboard-data";

export default async function MetaPage() {
  const data = await loadDashboardData();

  return (
    <AppShell activeSection="meta">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
              Format Snapshot
            </div>
            <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
              Meta Trends
            </h1>
            <p className="mt-3 max-w-3xl text-base text-[var(--on-surface-variant)]">
              Review the current snapshot teams, identify pressure points, and jump from matchup summaries into your broader analysis flow.
            </p>
          </div>
          <Link className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white" href="/analysis">
            Open Analysis Desk
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          {data.metaTeams.map((metaTeam) => (
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
      </div>
    </AppShell>
  );
}
