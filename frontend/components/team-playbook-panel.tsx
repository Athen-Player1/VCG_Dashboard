"use client";

import { MatchupSummary, MetaSnapshot, Team, TeamAnalysis } from "@/lib/types";

function findLikelyLeads(team: Team) {
  const scored = team.members
    .filter((member) => member.name.trim())
    .map((member) => {
      let score = 0;
      const moves = new Set(member.moves);
      const role = member.role.toLowerCase();

      if (moves.has("Fake Out")) score += 4;
      if (moves.has("Tailwind") || moves.has("Icy Wind") || moves.has("Trick Room")) score += 4;
      if (moves.has("Follow Me") || moves.has("Rage Powder")) score += 3;
      if (moves.has("Parting Shot") || moves.has("U-turn") || moves.has("Volt Switch")) score += 2;
      if (role.includes("support") || role.includes("pivot") || role.includes("speed")) score += 2;
      if (moves.has("Protect")) score += 1;

      return { name: member.name, score };
    })
    .sort((left, right) => right.score - left.score);

  return scored.slice(0, 3).map((entry) => entry.name);
}

function buildIdentity(team: Team, analysis?: TeamAnalysis) {
  const filled = team.members.filter((member) => member.name.trim());
  const roles = filled.map((member) => member.role).filter(Boolean);
  const keyRoles = roles.slice(0, 3).join(", ");
  const strengths = analysis?.strengths?.slice(0, 2) ?? [];

  return [
    `${team.name} is currently framed as a ${team.archetype.toLowerCase()} shell with ${filled.length} filled slots.`,
    keyRoles
      ? `The current board tools point toward ${keyRoles.toLowerCase()} as the main ways this team creates position.`
      : "Use the most proactive slots to claim speed or board control first, then pivot into your closers.",
    ...strengths
  ].filter(Boolean);
}

function buildOpeningGuidance(team: Team, analysis?: TeamAnalysis) {
  const leads = findLikelyLeads(team);
  const checks = analysis?.coverage_checks ?? [];
  const speedReady = checks.find((item) => item.label === "Speed control")?.status === "ready";
  const boardReady = checks.find((item) => item.label === "Board control")?.status === "ready";

  return [
    leads.length > 0
      ? `Default lead pool: ${leads.join(" / ")}. Start from the pieces that give you the safest first-turn positioning.`
      : "Default lead pool will be clearer once more slots and roles are filled in.",
    speedReady
      ? "Look for turns where your speed control can buy the first clean trade instead of forcing damage immediately."
      : "Because speed control is thin, avoid passive openings and protect your naturally faster mode carefully.",
    boardReady
      ? "Use your disruption tools early to deny the opponent's cleanest setup turn before committing tera."
      : "Without strong board-control tools, favor direct pressure and avoid lines that require too many defensive guesses."
  ];
}

function buildPriorityNotes(analysis?: TeamAnalysis) {
  const warnings = analysis?.warnings ?? [];
  const recommendations = analysis?.recommendations ?? [];

  return [...warnings.slice(0, 2), ...recommendations.slice(0, 3)];
}

function mergeThreatNames(snapshot?: MetaSnapshot, metaMatchups?: MatchupSummary[], team?: Team) {
  const saved = team?.playbook.threatPlans.map((entry) => entry.threat) ?? [];
  return Array.from(
    new Set([
      ...saved,
      ...(snapshot?.threats.map((item) => item.name) ?? []),
      ...(metaMatchups?.slice(0, 5).map((item) => item.meta_team_name) ?? [])
    ])
  ).slice(0, 8);
}

export function TeamPlaybookPanel({
  team,
  analysis,
  activeSnapshot,
  metaMatchups
}: {
  team: Team;
  analysis?: TeamAnalysis;
  activeSnapshot?: MetaSnapshot;
  metaMatchups?: MatchupSummary[];
}) {
  const identity = buildIdentity(team, analysis);
  const openings = buildOpeningGuidance(team, analysis);
  const priorities = buildPriorityNotes(analysis);
  const threatNames = mergeThreatNames(activeSnapshot, metaMatchups, team);

  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold">How To Play This Team</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--on-surface-variant)]">
            This section is generated from the team&apos;s current six and updates as the comp
            changes, so it can stay useful across different archetypes instead of being hard-coded
            for one team style.
          </p>
        </div>
        <div className="rounded-full bg-[var(--secondary-fixed)] px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--secondary)]">
          Dynamic Playbook
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <article className="rounded-[1.25rem] bg-[var(--surface-container-low)] p-5">
          <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Team Identity
          </div>
          <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--on-surface-variant)]">
            {identity.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </article>

        <article className="rounded-[1.25rem] bg-[var(--surface-container-low)] p-5">
          <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Default Flow
          </div>
          <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--on-surface-variant)]">
            {team.playbook.defaultPlan ? (
              <p className="font-medium text-[var(--on-surface)]">{team.playbook.defaultPlan}</p>
            ) : null}
            {openings.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </article>

        <article className="rounded-[1.25rem] bg-[var(--surface-container-low)] p-5">
          <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Priority Checks
          </div>
          <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--on-surface-variant)]">
            {team.playbook.pilotNotes ? (
              <p className="font-medium text-[var(--on-surface)]">{team.playbook.pilotNotes}</p>
            ) : null}
            {priorities.length > 0 ? (
              priorities.map((item) => <p key={item}>{item}</p>)
            ) : (
              <p>Fill more slots or roles to unlock more tailored pilot guidance.</p>
            )}
          </div>
        </article>
      </div>

      <div className="mt-6 rounded-[1.25rem] bg-[var(--surface-container-low)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-xl font-bold">Matchup Notebook</h3>
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
              Team-specific notes for the common meta threats currently visible in the active
              regulation snapshot.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {threatNames.map((threat) => {
            const savedPlan =
              team.playbook.threatPlans.find((entry) => entry.threat === threat)?.plan ?? "";
            const matchupPlan = metaMatchups?.find((entry) => entry.meta_team_name === threat)?.game_plan?.[0];
            const snapshotThreat = activeSnapshot?.threats.find((entry) => entry.name === threat);

            return (
              <article key={threat} className="rounded-[1.15rem] bg-white p-4">
                <div className="font-headline text-lg font-bold">{threat}</div>
                {savedPlan ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--on-surface)]">{savedPlan}</p>
                ) : null}
                {matchupPlan ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">
                    Suggested line: {matchupPlan}
                  </p>
                ) : null}
                {snapshotThreat ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">
                    Why it matters: {snapshotThreat.reason}
                  </p>
                ) : null}
                {!savedPlan && !matchupPlan && !snapshotThreat ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">
                    Add a plan for this matchup from Team Settings to keep your prep attached to the
                    team.
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
