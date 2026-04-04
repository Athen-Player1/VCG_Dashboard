import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ShowdownImportPanel } from "@/components/showdown-import-panel";
import { TeamManagementPanel } from "@/components/team-management-panel";
import { loadDashboardData } from "@/lib/dashboard-data";

export default async function TeamsPage({
  searchParams
}: {
  searchParams?: Promise<{ query?: string; compose?: string }>;
}) {
  const data = await loadDashboardData();
  const params = (await searchParams) ?? {};
  const query = params.query?.trim().toLowerCase() ?? "";
  const teams = query
    ? data.teams.filter((team) => {
        const searchable = [
          team.name,
          team.archetype,
          team.format,
          ...team.tags,
          ...team.members.map((member) => member.name)
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
    : data.teams;

  return (
    <AppShell activeSection="teams">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
              Team Workspace
            </div>
            <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
              Saved Teams
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[var(--on-surface-variant)]">
              Browse current team shells, jump into a team detail view, and use the import lab to turn Showdown text into structured teams.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              className="rounded-2xl border border-[var(--outline-variant)] bg-white px-5 py-3 font-headline text-sm font-bold text-[var(--on-surface)]"
              href="/teams#import-lab"
            >
              Import Team
            </Link>
            <Link
              className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white"
              href="/teams?compose=1#import-lab"
            >
              New Team Draft
            </Link>
          </div>
        </div>

        {params.compose ? (
          <TeamManagementPanel mode="create" />
        ) : null}

        <section className="grid gap-6 md:grid-cols-2">
          {teams.map((team) => (
            <article key={team.id} className="card-shadow rounded-[1.25rem] bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link className="font-headline text-xl font-bold hover:text-[var(--primary)]" href={`/teams/${team.id}`}>
                    {team.name}
                  </Link>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    {team.format} • {team.archetype}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--secondary-fixed)] px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                  {team.members.length} mons
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--on-surface-variant)]">{team.notes}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {team.members.map((member) => (
                  <span
                    key={`${team.id}-${member.name}`}
                    className="rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)]"
                  >
                    {member.name}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  className="rounded-xl bg-[var(--surface-container-low)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--primary)]"
                  href={`/teams/${team.id}`}
                >
                  Open Team
                </Link>
                <Link
                  className="rounded-xl bg-[var(--secondary-fixed)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--secondary)]"
                  href="/analysis"
                >
                  Analyze
                </Link>
              </div>
            </article>
          ))}
        </section>

        {teams.length === 0 ? (
          <section className="rounded-[1.25rem] bg-white p-8 text-center shadow-sm">
            <h2 className="font-headline text-2xl font-bold">No matching teams</h2>
            <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
              Try a different search term or import a new Showdown export below.
            </p>
          </section>
        ) : null}

        <ShowdownImportPanel />
      </div>
    </AppShell>
  );
}
