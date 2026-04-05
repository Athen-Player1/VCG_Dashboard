import { AppShell } from "@/components/app-shell";
import { loadActiveMetaSnapshot } from "@/lib/dashboard-data";

export default async function TopTeamsPage() {
  const snapshot = await loadActiveMetaSnapshot();
  const topTeams = snapshot?.metaTeams.slice(0, 5) ?? [];

  return (
    <AppShell activeSection="meta">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
            Top Snapshot Teams
          </div>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
            Top 5 Teams
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[var(--on-surface-variant)]">
            A quick prep page for the first five teams in the active stored snapshot.
          </p>
        </div>

        <section className="grid gap-6">
          {topTeams.map((team, index) => (
            <article key={team.id} className="rounded-[1.5rem] bg-white p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
                    Rank {index + 1}
                  </div>
                  <h2 className="mt-2 font-headline text-2xl font-bold">{team.name}</h2>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    {team.format} • {team.archetype}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[var(--primary)]">military_tech</span>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                    Core
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6">{team.core.join(" / ")}</p>
                </div>
                <div>
                  <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                    Pressure Points
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                    {team.pressurePoints.join(", ")}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Suggested Plan
                </div>
                <div className="mt-3 space-y-3">
                  {team.plan.map((step) => (
                    <div
                      key={step}
                      className="rounded-xl bg-[var(--surface-container-low)] px-4 py-3 text-sm leading-6 text-[var(--on-surface-variant)]"
                    >
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
