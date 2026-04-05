"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSimulationJob, getSimulationJobs, validateShowdownTeam } from "@/lib/api";
import { MetaSnapshot, ShowdownValidation, SimulationJob, Team } from "@/lib/types";

function statusBadge(status: SimulationJob["status"]) {
  if (status === "completed") {
    return "bg-[var(--secondary-fixed)] text-[var(--secondary)]";
  }

  if (status === "failed") {
    return "bg-[var(--error-container)] text-[var(--error)]";
  }

  return "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]";
}

export function SimulationControlPanel({
  teams,
  jobs: initialJobs,
  activeSnapshot
}: {
  teams: Team[];
  jobs: SimulationJob[];
  activeSnapshot?: MetaSnapshot;
}) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [opponentMode, setOpponentMode] = useState<"top_meta" | "input_team">("top_meta");
  const [showdownText, setShowdownText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [validationStatus, setValidationStatus] = useState<"idle" | "checking" | "error">("idle");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [validation, setValidation] = useState<ShowdownValidation | null>(null);

  const topMetaLabel = useMemo(
    () => activeSnapshot?.metaTeams[0]?.name ?? "No active meta team available",
    [activeSnapshot]
  );

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    const shouldPoll = jobs.some((job) => job.status === "queued" || job.status === "running");
    if (!shouldPoll) {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      try {
        const latestJobs = await getSimulationJobs();
        setJobs(latestJobs);
      } catch {
        // keep the current UI steady if polling fails briefly
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, [jobs]);

  async function handleLaunch() {
    setStatus("saving");
    setError("");

    try {
      await createSimulationJob({
        teamId,
        opponentMode,
        requestedGames: 10,
        showdownText: opponentMode === "input_team" ? showdownText : undefined
      });
      const latestJobs = await getSimulationJobs();
      setJobs(latestJobs);
      setShowdownText("");
      setStatus("idle");
      router.refresh();
    } catch (caughtError) {
      setStatus("error");
      setError(caughtError instanceof Error ? caughtError.message : "Failed to launch simulation");
    }
  }

  async function handleValidateOpponent() {
    setValidationStatus("checking");
    setValidationError("");

    try {
      const result = await validateShowdownTeam({
        format: teams.find((team) => team.id === teamId)?.format ?? "Regulation H",
        showdownText
      });
      setValidation(result);
      setValidationStatus("idle");
    } catch (caughtError) {
      setValidationStatus("error");
      setValidationError(
        caughtError instanceof Error ? caughtError.message : "Failed to validate opponent team"
      );
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[1.5rem] bg-white p-8 shadow-sm">
        <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
          Phase 6 MVP
        </div>
        <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight">
          Launch Background Sims
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">
          Start a 10-game batch against the active snapshot&apos;s top team or against a pasted
          Showdown import. Jobs run behind the scenes in the worker container and save their
          summaries here.
        </p>
        {error ? <p className="mt-4 text-sm font-semibold text-[var(--error)]">{error}</p> : null}

        <div className="mt-6 space-y-5">
          <div>
            <label className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--outline)]">
              Your Team
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-sm outline-none focus:border-[var(--secondary)]"
              onChange={(event) => setTeamId(event.target.value)}
              value={teamId}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} • {team.format}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--outline)]">
              Opponent Mode
            </label>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <button
                className={`rounded-2xl px-4 py-4 text-left transition-all ${
                  opponentMode === "top_meta"
                    ? "bg-[var(--secondary-fixed)] text-[var(--secondary)]"
                    : "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]"
                }`}
                onClick={() => setOpponentMode("top_meta")}
                type="button"
              >
                <div className="font-headline text-sm font-bold">Top Meta Team</div>
                <div className="mt-2 text-xs">{topMetaLabel}</div>
              </button>
              <button
                className={`rounded-2xl px-4 py-4 text-left transition-all ${
                  opponentMode === "input_team"
                    ? "bg-[var(--secondary-fixed)] text-[var(--secondary)]"
                    : "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]"
                }`}
                onClick={() => setOpponentMode("input_team")}
                type="button"
              >
                <div className="font-headline text-sm font-bold">Input Team</div>
                <div className="mt-2 text-xs">Paste a Showdown export for the opponent shell.</div>
              </button>
            </div>
          </div>

          {opponentMode === "input_team" ? (
            <div>
              <label className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--outline)]">
                Opponent Showdown Import
              </label>
              <textarea
                className="mt-2 min-h-52 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 font-mono text-xs outline-none focus:border-[var(--secondary)]"
                onChange={(event) => {
                  setShowdownText(event.target.value);
                  setValidation(null);
                  setValidationError("");
                }}
                placeholder={"Incineroar @ Sitrus Berry\nAbility: Intimidate\n- Fake Out\n- Parting Shot"}
                value={showdownText}
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  className="rounded-xl bg-[var(--secondary-fixed)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={validationStatus === "checking" || !showdownText.trim()}
                  onClick={handleValidateOpponent}
                  type="button"
                >
                  {validationStatus === "checking" ? "Checking..." : "Validate Opponent"}
                </button>
                {validationError ? (
                  <span className="text-sm font-semibold text-[var(--error)]">
                    {validationError}
                  </span>
                ) : null}
              </div>
              {validation ? (
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[var(--on-surface)]">
                      Resolved format: {validation.formatResolved}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] ${
                        validation.valid
                          ? "bg-[var(--secondary-fixed)] text-[var(--secondary)]"
                          : "bg-[var(--error-container)] text-[var(--error)]"
                      }`}
                    >
                      {validation.valid ? "Valid" : "Issues Found"}
                    </span>
                  </div>
                  {validation.issues.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {validation.issues.slice(0, 3).map((issue) => (
                        <p key={issue} className="text-sm text-[var(--on-surface-variant)]">
                          {issue}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
                      Showdown accepted the pasted opponent shell.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={
              status === "saving" ||
              !teamId ||
              (opponentMode === "input_team" && !showdownText.trim())
            }
            onClick={handleLaunch}
            type="button"
          >
            {status === "saving" ? "Queueing 10 Sims..." : "Run 10 Matches"}
          </button>
        </div>
      </article>

      <article className="rounded-[1.5rem] bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-headline text-2xl font-bold">Simulation Queue</h2>
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
              Completed runs keep their stored win/loss summary, repeated issues, and the most
              common threat names that showed up in losses.
            </p>
          </div>
          <button
            className="rounded-xl bg-[var(--surface-container-low)] px-4 py-2 text-sm font-bold text-[var(--primary)]"
            onClick={async () => setJobs(await getSimulationJobs())}
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {jobs.length === 0 ? (
            <div className="rounded-2xl bg-[var(--surface-container-low)] px-4 py-5 text-sm text-[var(--on-surface-variant)]">
              No simulation jobs yet. Launch a 10-game batch to populate this lane.
            </div>
          ) : (
            jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-[1.25rem] bg-[var(--surface-container-low)] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-headline text-lg font-bold">
                      {job.teamName} vs {job.opponentLabel}
                    </div>
                    <div className="mt-1 text-xs text-[var(--outline)]">
                      {job.requestedGames} games • {job.id}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] ${statusBadge(job.status)}`}
                  >
                    {job.status}
                  </span>
                </div>

                {job.status === "completed" ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                        Record
                      </div>
                      <div className="mt-2 font-headline text-3xl font-extrabold">
                        {job.summary.wins}-{job.summary.losses}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[var(--secondary)]">
                        {job.summary.winRate}% win rate
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                        Repeated Issues
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-[var(--on-surface-variant)]">
                        {(job.summary.repeatedIssues ?? []).slice(0, 2).map((issue) => (
                          <p key={issue}>{issue}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 md:col-span-2">
                      <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                        Threats And Follow-Up
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(job.summary.topThreats ?? []).map((threat) => (
                          <span
                            key={threat}
                            className="rounded-full bg-[var(--secondary-fixed)] px-3 py-1 text-xs font-bold text-[var(--secondary)]"
                          >
                            {threat}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-[var(--on-surface-variant)]">
                        {(job.summary.recommendations ?? []).slice(0, 2).map((recommendation) => (
                          <p key={recommendation}>{recommendation}</p>
                        ))}
                      </div>
                      {job.summary.engineNote ? (
                        <p className="mt-4 text-xs text-[var(--outline)]">{job.summary.engineNote}</p>
                      ) : null}
                    </div>
                  </div>
                ) : job.status === "failed" ? (
                  <p className="mt-4 text-sm font-semibold text-[var(--error)]">{job.errorMessage}</p>
                ) : (
                  <p className="mt-4 text-sm text-[var(--on-surface-variant)]">
                    {job.status === "queued"
                      ? "Waiting for the worker to pick up the job."
                      : "The worker is currently running this batch."}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
