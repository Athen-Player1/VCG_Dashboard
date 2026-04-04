import Image from "next/image";
import Link from "next/link";
import { DashboardData, MetaTeam, Team, Threat } from "@/lib/types";
import { ShowdownImportPanel } from "./showdown-import-panel";

function TeamCard({ team }: { team: Team }) {
  return (
    <article className="card-shadow rounded-[1.25rem] bg-white p-6 transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <Link className="font-headline text-xl font-bold hover:text-[var(--primary)]" href={`/teams/${team.id}`}>
            {team.name}
          </Link>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--secondary-fixed)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
              {team.format}
            </span>
            <span className="rounded-full bg-[var(--surface-container)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--on-surface-variant)]">
              {team.archetype}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-label text-sm font-bold text-[var(--secondary)]">
            {team.elo ? `${team.elo} ELO` : "Scrim Team"}
          </div>
          <Link
            className="mt-2 inline-flex text-[var(--outline)] transition-colors hover:text-[var(--primary)]"
            href={`/teams/${team.id}`}
          >
            <span className="material-symbols-outlined">open_in_new</span>
          </Link>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-6">
        {team.members.map((member) => (
          <div
            key={`${team.id}-${member.name}`}
            className="rounded-2xl bg-[var(--surface-container-low)] p-3 text-center"
          >
            <div className="relative mx-auto -mt-7 h-16 w-16">
              <Image alt={member.name} className="object-contain drop-shadow-md" fill sizes="64px" src={member.image} />
            </div>
            <div className="mt-2 font-label text-[10px] font-bold uppercase tracking-[0.12em]">
              {member.name}
            </div>
            <div className="mt-2 flex justify-center gap-1">
              {member.types.map((type) => (
                <span
                  key={`${member.name}-${type}`}
                  className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--on-surface-variant)]"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-[var(--on-surface-variant)]">{team.notes}</p>
    </article>
  );
}

function ThreatPanel({ threats }: { threats: Threat[] }) {
  return (
    <section className="card-shadow rounded-[1.25rem] bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-headline text-lg font-bold">Threat Radar</h2>
        <span className="material-symbols-outlined text-[var(--secondary)]">radar</span>
      </div>
      <div className="space-y-4">
        {threats.map((threat) => (
          <div
            key={threat.name}
            className="rounded-2xl bg-[var(--surface-container-low)] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-headline text-base font-bold">{threat.name}</div>
              <span
                className={`rounded-full px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] ${
                  threat.threatLevel === "High"
                    ? "bg-[var(--error-container)] text-[var(--error)]"
                    : threat.threatLevel === "Medium"
                      ? "bg-[#fff0cf] text-[var(--tertiary)]"
                      : "bg-[var(--secondary-fixed)] text-[var(--secondary)]"
                }`}
              >
                {threat.threatLevel} threat
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--on-surface-variant)]">{threat.reason}</p>
            <p className="mt-2 text-sm font-semibold text-[var(--secondary)]">{threat.counterplay}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetaCard({ metaTeam }: { metaTeam: MetaTeam }) {
  return (
    <div className="rounded-[1.25rem] bg-[var(--surface-container-low)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link className="font-headline text-lg font-bold hover:text-[var(--primary)]" href={`/meta#${metaTeam.id}`}>
            {metaTeam.name}
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--outline)]">
            {metaTeam.format} • {metaTeam.archetype}
          </p>
        </div>
        <Link className="text-[var(--primary)]" href={`/meta#${metaTeam.id}`}>
          <span className="material-symbols-outlined">strategy</span>
        </Link>
      </div>
      <div className="mt-4">
        <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
          Common Core
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--on-surface)]">
          {metaTeam.core.join(" / ")}
        </p>
      </div>
      <div className="mt-4">
        <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
          Pressure Points
        </div>
        <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
          {metaTeam.pressurePoints.join(", ")}
        </p>
      </div>
      <div className="mt-4">
        <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
          Suggested Plan
        </div>
        <ul className="mt-2 space-y-2 text-sm text-[var(--on-surface-variant)]">
          {metaTeam.plan.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[var(--primary)]" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function DashboardShell({ data }: { data: DashboardData }) {
  const [activeTeam, secondaryTeam] = data.teams;

  return (
    <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
                Format snapshot
              </div>
              <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
                Team Architect Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-base text-[var(--on-surface-variant)]">
                Save teams, import Showdown exports, compare into the current field, and build matchup plans around the lines you actually want to bring.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-2xl border border-[var(--outline-variant)] bg-white px-5 py-3 font-headline text-sm font-bold text-[var(--on-surface)] transition-colors hover:bg-[var(--surface-container-low)]"
                href="/teams#import-lab"
              >
                Paste Showdown Team
              </Link>
              <Link
                className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white shadow-lg shadow-red-200 transition-transform hover:-translate-y-0.5"
                href="/teams?compose=1"
              >
                Build New Team
              </Link>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-12">
            <section className="space-y-8 xl:col-span-8">
              <TeamCard team={activeTeam} />
              <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
                <article className="card-shadow rounded-[1.25rem] bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-headline text-lg font-bold">{secondaryTeam.name}</h2>
                      <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                        Stored bench team ready for side-by-side prep and further tuning.
                      </p>
                    </div>
                    <Link className="font-headline text-sm font-bold text-[var(--primary)]" href={`/teams/${secondaryTeam.id}`}>
                      Open
                    </Link>
                  </div>
                  <div className="mt-6 flex -space-x-3">
                    {secondaryTeam.members.slice(0, 4).map((member) => (
                      <div
                        key={member.name}
                        className="relative h-14 w-14 overflow-hidden rounded-full border-4 border-white bg-[var(--surface-container-low)]"
                      >
                        <Image alt={member.name} className="object-contain p-1.5" fill sizes="56px" src={member.image} />
                      </div>
                    ))}
                    <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-[var(--surface-container-low)] font-label text-xs font-bold text-[var(--outline)]">
                      +2
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                      Meta fit score
                    </span>
                    <span className="font-headline text-lg font-bold text-[var(--secondary)]">78 / 100</span>
                  </div>
                </article>

                <article className="rounded-[1.25rem] border-2 border-dashed border-[var(--outline-variant)] bg-white/75 p-6 transition-colors hover:bg-[var(--primary)]/5">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--surface-container)]">
                    <span className="material-symbols-outlined text-[var(--outline)]">save</span>
                  </div>
                  <h2 className="mt-5 font-headline text-lg font-bold">Saved Team Slots</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                    PostgreSQL-backed team storage is the next backend slice. The layout is already prepared for multi-team management and comparisons.
                  </p>
                  <Link
                    className="mt-6 inline-flex rounded-xl bg-[var(--surface-container-low)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--primary)]"
                    href="/teams"
                  >
                    Open Teams Workspace
                  </Link>
                </article>
              </div>

              <ShowdownImportPanel />

              <section className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline text-2xl font-bold">Weakness Matrix</h2>
                    <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                      Snapshot for {data.activeFormat}
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--error)]">
                    Focus needed
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {data.weaknessSummary.map((item) => (
                    <div key={item} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--outline)]">
                        Team note
                      </div>
                      <p className="mt-2 text-sm font-semibold leading-6">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                  <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                    Recommendations
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {data.recommendations.map((item) => (
                      <div
                        key={item}
                        className="rounded-xl bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-[1.5rem] bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline text-2xl font-bold">Meta Team Plans</h2>
                    <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                      Matchup prep cards generated from your active team shell.
                    </p>
                  </div>
                  <Link
                    className="rounded-xl bg-[var(--secondary-fixed)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--secondary)]"
                    href="/meta"
                  >
                    Compare All
                  </Link>
                </div>
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {data.metaTeams.map((metaTeam) => (
                    <MetaCard key={metaTeam.id} metaTeam={metaTeam} />
                  ))}
                </div>
              </section>
            </section>

            <aside className="space-y-6 xl:col-span-4">
              <div className="sticky top-24 space-y-6">
                <ThreatPanel threats={data.threats} />
                <section className="card-shadow rounded-[1.25rem] bg-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline text-lg font-bold">Build Queue</h2>
                    <span className="material-symbols-outlined text-[var(--outline)]">deployed_code</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    {[
                      "Frontend shell adapted from Stitch references",
                      "Showdown import parser endpoint connected",
                      "Saved team persistence with PostgreSQL",
                      "Meta snapshot admin workflow",
                      "Simulation worker reserved for later phase"
                    ].map((item, index) => (
                      <div key={item} className="flex gap-3">
                        <div className={`mt-1 h-3 w-3 rounded-full ${index < 2 ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <p className="text-sm leading-6 text-[var(--on-surface-variant)]">{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[var(--inverse-surface)] to-slate-800 p-6 text-[var(--inverse-on-surface)]">
                  <div className="relative z-10">
                    <div className="font-label text-[10px] uppercase tracking-[0.22em] text-slate-300">
                      Meta Watch
                    </div>
                    <h2 className="mt-3 font-headline text-xl font-bold">
                      Prioritize Ground and Speed Counterplay
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      Your current shell handles slower balance teams well, but repeated Ground pressure and faster special offense still force awkward defensive lines.
                    </p>
                    <Link
                      className="mt-5 inline-flex rounded-xl bg-white/15 px-4 py-2.5 font-headline text-sm font-bold backdrop-blur-sm"
                      href="/analysis"
                    >
                      Run Full Analysis
                    </Link>
                  </div>
                </section>
              </div>
            </aside>
          </div>
    </div>
  );
}
