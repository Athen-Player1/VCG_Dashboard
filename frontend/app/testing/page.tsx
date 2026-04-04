import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function TestingPage() {
  return (
    <AppShell activeSection="testing">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
            Reserved Lane
          </div>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
            Testing and Simulation
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[var(--on-surface-variant)]">
            This route is intentionally connected now so the nav has a real destination. The automated simulator and deeper testing workflows will be built here after the core dashboard is complete.
          </p>
        </div>

        <section className="rounded-[1.5rem] bg-white p-8 shadow-sm">
          <h2 className="font-headline text-2xl font-bold">Planned work for this area</h2>
          <div className="mt-6 space-y-3">
            {[
              "Background battle-simulation worker service",
              "Queued matchup batch runs against popular teams and mons",
              "Aggregate weakness reports from repeated simulated games",
              "Observed loss-pattern dashboards and common threat summaries"
            ].map((item) => (
              <div key={item} className="rounded-xl bg-[var(--surface-container-low)] px-4 py-3 text-sm leading-6 text-[var(--on-surface-variant)]">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Link className="rounded-xl bg-[var(--secondary-fixed)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--secondary)]" href="/analysis">
              Open Analysis
            </Link>
            <Link className="rounded-xl bg-[var(--surface-container-low)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--primary)]" href="/teams">
              Open Teams
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
