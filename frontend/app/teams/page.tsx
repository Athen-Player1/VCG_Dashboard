import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ShowdownImportPanel } from "@/components/showdown-import-panel";
import { TeamManagementPanel } from "@/components/team-management-panel";
import { getSmogonSet, searchPokemon } from "@/lib/api";
import { loadDashboardData } from "@/lib/dashboard-data";

export default async function TeamsPage({
  searchParams
}: {
  searchParams?: Promise<{ query?: string; compose?: string }>;
}) {
  const data = await loadDashboardData();
  const params = (await searchParams) ?? {};
  const query = params.query?.trim().toLowerCase() ?? "";
  const pokemonMatches = query
    ? await searchPokemon(query).catch(() => [])
    : [];
  const pokemonCards = query
    ? await Promise.all(
        pokemonMatches.map(async (pokemon) => ({
          pokemon,
          smogonSet: pokemon.smogonSetAvailable
            ? await getSmogonSet(pokemon.name).catch(() => null)
            : null
        }))
      )
    : [];
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
        <div>
          <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
            Team Workspace
          </div>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight">
            Saved Teams
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[var(--on-surface-variant)]">
            Browse current team shells, jump into a team detail view, and use the import lab to
            turn Showdown text into structured teams.
          </p>
        </div>

        {params.compose || teams.length === 0 ? (
          <TeamManagementPanel mode="create" />
        ) : null}

        {query ? (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
                  Unified Search
                </div>
                <h2 className="mt-2 font-headline text-2xl font-bold">Pokemon Results</h2>
                <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                  Species matches come from the Smogon-backed Pokemon lookup, while team matches
                  search your saved workspace.
                </p>
              </div>
              <span className="rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)]">
                {pokemonMatches.length} Pokemon match{pokemonMatches.length === 1 ? "" : "es"}
              </span>
            </div>

            {pokemonMatches.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pokemonCards.map(({ pokemon, smogonSet }) => (
                  <article key={pokemon.name} className="card-shadow rounded-[1.25rem] bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-headline text-lg font-bold">{pokemon.name}</h3>
                        <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                          {pokemon.types.join(" / ") || "Type data unavailable"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--secondary-fixed)] px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                        {pokemon.smogonSetAvailable ? "Set Ready" : "Species"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {pokemon.formats.slice(0, 3).map((format) => (
                        <span
                          key={`${pokemon.name}-${format}`}
                          className="rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)]"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                    {smogonSet ? (
                      <div className="mt-5 rounded-[1rem] bg-[var(--surface-container-low)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-headline text-base font-bold">{smogonSet.setName}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                              {smogonSet.format}
                            </p>
                          </div>
                          {smogonSet.teraType ? (
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)] ring-1 ring-[var(--outline-variant)]">
                              Tera {smogonSet.teraType}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-[var(--on-surface-variant)]">
                          <p>
                            <span className="font-semibold text-[var(--foreground)]">Item:</span>{" "}
                            {smogonSet.item}
                          </p>
                          <p>
                            <span className="font-semibold text-[var(--foreground)]">Ability:</span>{" "}
                            {smogonSet.ability}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {smogonSet.moves.map((move) => (
                            <span
                              key={`${pokemon.name}-${move}`}
                              className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)] ring-1 ring-[var(--outline-variant)]"
                            >
                              {move}
                            </span>
                          ))}
                        </div>
                        <p className="mt-4 text-xs text-[var(--on-surface-variant)]">
                          Source credited to Smogon Strategy Dex.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[1rem] bg-[var(--surface-container-low)] p-4">
                        <p className="font-headline text-base font-bold">No Smogon set yet</p>
                        <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                          This species matched the search, but no VGC-ready Smogon set was available to
                          show inline.
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <section className="rounded-[1.25rem] bg-white p-8 text-center shadow-sm">
                <h3 className="font-headline text-xl font-bold">No Pokemon species matched</h3>
                <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
                  Try a broader species name or open the team builder to search directly inside a slot.
                </p>
              </section>
            )}
          </section>
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
                  href={`/analysis?team=${team.id}`}
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
              {query
                ? "Try a different search term or import a new Showdown export below."
                : "Start with a blank team shell or paste a Showdown export below."}
            </p>
          </section>
        ) : null}

        <ShowdownImportPanel />
      </div>
    </AppShell>
  );
}
