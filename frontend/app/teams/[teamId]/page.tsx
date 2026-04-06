import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TeamAnalysisPanel } from "@/components/team-analysis-panel";
import { TeamBuilderPanel } from "@/components/team-builder-panel";
import { TeamManagementPanel } from "@/components/team-management-panel";
import { TeamPlaybookPanel } from "@/components/team-playbook-panel";
import {
  loadActiveMetaSnapshot,
  loadTeamAnalysis,
  loadTeamById,
  loadTeamMetaMatchups
} from "@/lib/dashboard-data";

export default async function TeamDetailPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const [team, analysis, activeSnapshot, metaMatchups] = await Promise.all([
    loadTeamById(teamId),
    loadTeamAnalysis(teamId),
    loadActiveMetaSnapshot(),
    loadTeamMetaMatchups(teamId)
  ]);

  if (!team) {
    notFound();
  }

  return (
    <AppShell
      activeSection="teams"
      pageNavigation={[
        { href: `/teams/${team.id}`, label: `${team.name} Overview`, icon: "overview" },
        { href: `/teams/${team.id}#team-builder`, label: "Builder", icon: "build" },
        { href: `/teams/${team.id}#team-playbook`, label: "Playbook", icon: "menu_book" },
        { href: `/teams/${team.id}#team-analysis`, label: "Analysis", icon: "analytics" },
        { href: `/teams/${team.id}#team-settings`, label: "Settings", icon: "settings" }
      ]}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <Link
            className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]"
            href="/teams"
          >
            Back to Teams
          </Link>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
            {team.name}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[var(--on-surface-variant)]">
            {team.format} • {team.archetype} • {team.notes}
          </p>
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
                <p className="mt-2 text-sm font-semibold text-[var(--on-surface)]">
                  {member.role}
                </p>
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

        <div id="team-builder">
          <TeamBuilderPanel team={team} />
        </div>

        <div id="team-playbook">
          <TeamPlaybookPanel
            activeSnapshot={activeSnapshot}
            analysis={analysis}
            metaMatchups={metaMatchups}
            team={team}
          />
        </div>

        <div id="team-analysis">{analysis ? <TeamAnalysisPanel analysis={analysis} /> : null}</div>

        <div id="team-settings">
          <TeamManagementPanel
            mode="edit"
            suggestedThreats={Array.from(
              new Set([
                ...(activeSnapshot?.threats.map((threat) => threat.name) ?? []),
                ...(metaMatchups?.slice(0, 5).map((matchup) => matchup.meta_team_name) ?? [])
              ])
            ).slice(0, 8)}
            team={team}
          />
        </div>
      </div>
    </AppShell>
  );
}
