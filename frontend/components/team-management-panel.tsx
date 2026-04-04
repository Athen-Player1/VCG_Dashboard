"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTeam, deleteTeam, updateTeam } from "@/lib/api";
import { Team } from "@/lib/types";

function parseTags(rawTags: string): string[] {
  return rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function TeamManagementPanel({
  mode,
  team
}: {
  mode: "create" | "edit";
  team?: Team;
}) {
  const router = useRouter();
  const [name, setName] = useState(team?.name ?? "");
  const [format, setFormat] = useState(team?.format ?? "Regulation H");
  const [archetype, setArchetype] = useState(team?.archetype ?? "Balance");
  const [notes, setNotes] = useState(team?.notes ?? "");
  const [tags, setTags] = useState(team?.tags.join(", ") ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "deleting" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setStatus("saving");
    setError("");

    try {
      const payload = {
        name,
        format,
        archetype,
        notes,
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
