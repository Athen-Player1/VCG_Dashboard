import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TeamAnalysisPanel } from "@/components/team-analysis-panel";
import { TeamBuilderPanel } from "@/components/team-builder-panel";
import { TeamManagementPanel } from "@/components/team-management-panel";
import { loadTeamAnalysis, loadTeamById } from "@/lib/dashboard-data";

export default async function TeamDetailPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = await loadTeamById(teamId);
  const analysis = await loadTeamAnalysis(teamId);

  if (!team) {
    notFound();
  }

  return (
    <AppShell activeSection="teams">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Link className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]" href="/teams">
              Back to Teams
            </Link>
            <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
              {team.name}
            </h1>
            <p className="mt-3 max-w-3xl text-base text-[var(--on-surface-variant)]">
              {team.format} • {team.archetype} • {team.notes}
            </p>
          </div>
          <div className="flex gap-3">
            <Link className="rounded-2xl bg-[var(--secondary-fixed)] px-5 py-3 font-headline text-sm font-bold text-[var(--secondary)]" href="/analysis">
              Run Analysis
            </Link>
            <Link className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white" href="/meta">
              Compare to Meta
            </Link>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {team.members.map((member) => (
            <article key={member.name} className="card-shadow rounded-[1.25rem] bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline text-xl font-bold">{member.name}</h2>
                  <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                    {member.item} • {member.ability}
                  </p>
                </div>
                {member.teraType ? (
                  <span className="rounded-full bg-[var(--secondary-fixed)] px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                    Tera {member.teraType}
                  </span>
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {member.types.map((type) => (
                  <span
                    key={`${member.name}-${type}`}
                    className="rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)]"
                  >
                    {type}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Role
                </div>
                <p className="mt-2 text-sm font-semibold text-[var(--on-surface)]">{member.role}</p>
              </div>
              <div className="mt-5">
                <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Moves
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {member.moves.map((move) => (
                    <span
                      key={`${member.name}-${move}`}
                      className="rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)]"
                    >
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <TeamBuilderPanel team={team} />

        {analysis ? <TeamAnalysisPanel analysis={analysis} /> : null}

        <TeamManagementPanel mode="edit" team={team} />
      </div>
    </AppShell>
  );
}
