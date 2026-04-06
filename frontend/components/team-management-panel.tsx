"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTeam, deleteTeam, updateTeam } from "@/lib/api";
import { Team, TeamThreatPlan } from "@/lib/types";

function parseTags(rawTags: string): string[] {
  return rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function TeamManagementPanel({
  mode,
  team,
  suggestedThreats = []
}: {
  mode: "create" | "edit";
  team?: Team;
  suggestedThreats?: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState(team?.name ?? "");
  const [format, setFormat] = useState(team?.format ?? "");
  const [archetype, setArchetype] = useState(team?.archetype ?? "Balance");
  const [notes, setNotes] = useState(team?.notes ?? "");
  const [defaultPlan, setDefaultPlan] = useState(team?.playbook.defaultPlan ?? "");
  const [pilotNotes, setPilotNotes] = useState(team?.playbook.pilotNotes ?? "");
  const [tags, setTags] = useState(team?.tags.join(", ") ?? "");
  const seededThreatPlans = (() => {
    const savedPlans = team?.playbook.threatPlans ?? [];
    const planMap = new Map(savedPlans.map((entry) => [entry.threat, entry.plan]));
    const mergedThreats = Array.from(
      new Set([...savedPlans.map((entry) => entry.threat), ...suggestedThreats])
    );

    return mergedThreats.map((threat) => ({
      threat,
      plan: planMap.get(threat) ?? ""
    }));
  })();
  const [threatPlans, setThreatPlans] = useState<TeamThreatPlan[]>(seededThreatPlans);
  const [status, setStatus] = useState<"idle" | "saving" | "deleting" | "error">("idle");
  const [error, setError] = useState("");

  function updateThreatPlan(index: number, plan: string) {
    setThreatPlans((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, plan } : entry))
    );
  }

  async function handleSubmit() {
    setStatus("saving");
    setError("");

    try {
      const payload = {
        name,
        format,
        archetype,
        notes,
        playbook: {
          defaultPlan,
          pilotNotes,
          threatPlans: threatPlans.filter((entry) => entry.threat.trim() || entry.plan.trim())
        },
        tags: parseTags(tags),
        members: team?.members ?? []
      };

      if (mode === "create") {
        const created = await createTeam(payload);
        router.push(`/teams/${created.id}`);
      } else if (team) {
        await updateTeam(team.id, payload);
        setStatus("idle");
        router.refresh();
      }
    } catch (caughtError) {
      setStatus("error");
      setError(caughtError instanceof Error ? caughtError.message : "Save failed");
    }
  }

  async function handleDelete() {
    if (!team) {
      return;
    }

    setStatus("deleting");
    setError("");

    try {
      await deleteTeam(team.id);
      setStatus("idle");
      router.push("/teams");
      router.refresh();
    } catch (caughtError) {
      setStatus("error");
      setError(caughtError instanceof Error ? caughtError.message : "Delete failed");
    }
  }

  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold">
            {mode === "create" ? "Create Team Shell" : "Team Settings"}
          </h2>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            {mode === "create"
              ? "Create a blank team entry you can flesh out later."
              : "Edit the stored metadata for this team and keep the routed workspace in sync."}
          </p>
        </div>
        {mode === "edit" && team ? (
          <Link
            className="rounded-xl bg-[var(--secondary-fixed)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--secondary)]"
            href="/analysis"
          >
            Analyze
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Team name
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>

        <label className="block">
          <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Format
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
            onChange={(event) => setFormat(event.target.value)}
            value={format}
          />
        </label>

        <label className="block">
          <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Archetype
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
            onChange={(event) => setArchetype(event.target.value)}
            value={archetype}
          />
        </label>

        <label className="block">
          <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Tags
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
            onChange={(event) => setTags(event.target.value)}
            placeholder="Sun, Balance, Open Team Sheet"
            value={tags}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
          Notes
        </span>
        <textarea
          className="mt-2 min-h-32 w-full rounded-[1.25rem] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
          onChange={(event) => setNotes(event.target.value)}
          value={notes}
        />
      </label>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <label className="block">
          <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Default Game Plan
          </span>
          <textarea
            className="mt-2 min-h-36 w-full rounded-[1.25rem] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
            onChange={(event) => setDefaultPlan(event.target.value)}
            placeholder="How do you usually lead, stabilize the board, and close games with this team?"
            value={defaultPlan}
          />
        </label>

        <label className="block">
          <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Pilot Notes
          </span>
          <textarea
            className="mt-2 min-h-36 w-full rounded-[1.25rem] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
            onChange={(event) => setPilotNotes(event.target.value)}
            placeholder="Extra reminders, tera discipline, lead traps, positioning notes, or endgame rules."
            value={pilotNotes}
          />
        </label>
      </div>

      <div className="mt-6 rounded-[1.25rem] bg-[var(--surface-container-low)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-xl font-bold">Matchup Notebook</h3>
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
              Save your plan into common meta threats so each team keeps its own prep notes.
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {threatPlans.length > 0 ? (
            threatPlans.map((entry, index) => (
              <label key={entry.threat} className="block rounded-[1.15rem] bg-white p-4">
                <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  {entry.threat}
                </span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
                  onChange={(event) => updateThreatPlan(index, event.target.value)}
                  placeholder={`What is your plan into ${entry.threat}?`}
                  value={entry.plan}
                />
              </label>
            ))
          ) : (
            <p className="text-sm text-[var(--on-surface-variant)]">
              Threat slots will appear here once the team page has live meta context.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-5 py-3 font-headline text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "saving" || status === "deleting" || !name.trim() || !format.trim() || !archetype.trim()}
          onClick={handleSubmit}
          type="button"
        >
          {status === "saving" ? "Saving..." : mode === "create" ? "Create Team" : "Save Changes"}
        </button>

        {mode === "edit" && team ? (
          <button
            className="rounded-2xl bg-[var(--error-container)] px-5 py-3 font-headline text-sm font-bold text-[var(--error)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={status === "saving" || status === "deleting"}
            onClick={handleDelete}
            type="button"
          >
            {status === "deleting" ? "Deleting..." : "Delete Team"}
          </button>
        ) : null}

        {error ? <p className="text-sm font-semibold text-[var(--error)]">{error}</p> : null}
      </div>
    </section>
  );
}
