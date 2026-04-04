import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { loadDashboardData } from "@/lib/dashboard-data";

export default async function AnalysisPage() {
  const data = await loadDashboardData();

  return (
    <AppShell activeSection="analysis">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
              Analysis Desk
            </div>
            <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
              Team Analysis
            </h1>
            <p className="mt-3 max-w-3xl text-base text-[var(--on-surface-variant)]">
              This page centralizes the current weakness matrix, threat radar, and next recommended adjustments for the active format snapshot.
            </p>
          </div>
          <Link className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white" href="/meta">
            Review Meta Matchups
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.5rem] bg-white p-8 shadow-sm">
            <h2 className="font-headline text-2xl font-bold">Weakness Matrix</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {data.weaknessSummary.map((item) => (
                <div key={item} className="rounded-2xl bg-[var(--surface-container-low)] p-4">
                  <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                    Team note
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.5rem] bg-white p-8 shadow-sm">
            <h2 className="font-headline text-2xl font-bold">Recommendations</h2>
            <div className="mt-6 space-y-3">
              {data.recommendations.map((item) => (
                <div key={item} className="rounded-2xl bg-[var(--surface-container-low)] px-4 py-4 text-sm leading-6 text-[var(--on-surface-variant)]">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[1.5rem] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-headline text-2xl font-bold">Threat Radar</h2>
            <Link className="rounded-xl bg-[var(--secondary-fixed)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--secondary)]" href="/teams">
              Open Team Workspace
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {data.threats.map((threat) => (
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
      </div>
    </AppShell>
  );
}
