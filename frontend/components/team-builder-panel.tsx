"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateTeam } from "@/lib/api";
import { ChipListInput } from "@/components/chip-list-input";
import { getPokemonImageUrl, normalizePokemonSlot } from "@/lib/pokemon";
import { PokemonSlot, Team } from "@/lib/types";

const emptyMember = (): PokemonSlot => ({
  name: "",
  item: "",
  ability: "",
  types: [],
  moves: [],
  role: "",
  teraType: "",
  image: ""
});

function validateMember(member: PokemonSlot, allMembers: PokemonSlot[]): string[] {
  const issues: string[] = [];
  const hasAnyContent =
    Boolean(member.name.trim()) ||
    Boolean(member.item.trim()) ||
    Boolean(member.ability.trim()) ||
    member.types.length > 0 ||
    member.moves.length > 0 ||
    Boolean(member.role.trim()) ||
    Boolean(member.teraType?.trim());

  if (!hasAnyContent) {
    return issues;
  }

  if (!member.name.trim()) {
    issues.push("Species is required once a slot has data.");
  }

  if (member.types.length > 2) {
    issues.push("Use at most 2 types.");
  }

  if (member.moves.length > 4) {
    issues.push("Use at most 4 moves.");
  }

  const normalizedName = member.name.trim().toLowerCase();
  if (normalizedName) {
    const duplicateCount = allMembers.filter(
      (candidate) => candidate.name.trim().toLowerCase() === normalizedName
    ).length;

    if (duplicateCount > 1) {
      issues.push("Duplicate species detected in the current team shell.");
    }
  }

  return issues;
}

export function TeamBuilderPanel({ team }: { team: Team }) {
  const router = useRouter();
  const [members, setMembers] = useState<PokemonSlot[]>(
    Array.from({ length: 6 }, (_, index) => team.members[index] ?? emptyMember())
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  function updateMember(index: number, nextMember: PokemonSlot) {
    setMembers((current) =>
      current.map((member, memberIndex) => (memberIndex === index ? nextMember : member))
    );
  }

  async function handleSaveMembers() {
    setStatus("saving");
    setError("");

    try {
      const validationIssues = members.flatMap((member, index) =>
        validateMember(member, members).map((issue) => `Slot ${index + 1}: ${issue}`)
      );

      if (validationIssues.length > 0) {
        setStatus("error");
        setError(validationIssues[0]);
        return;
      }

      const cleanedMembers = members
        .filter((member) => member.name.trim())
        .map((member) => normalizePokemonSlot(member));

      await updateTeam(team.id, {
        name: team.name,
        format: team.format,
        archetype: team.archetype,
        notes: team.notes,
        tags: team.tags,
        members: cleanedMembers
      });

      setStatus("idle");
      router.refresh();
    } catch (caughtError) {
      setStatus("error");
      setError(caughtError instanceof Error ? caughtError.message : "Failed to save team members");
    }
  }

  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold">Team Builder</h2>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            Edit up to six team slots. Empty slots are ignored when you save.
          </p>
        </div>
        <button
          className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-5 py-3 font-headline text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "saving"}
          onClick={handleSaveMembers}
          type="button"
        >
          {status === "saving" ? "Saving Slots..." : "Save Team Slots"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-[var(--error)]">{error}</p> : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member, index) => (
          (() => {
            const memberIssues = validateMember(member, members);

            return (
          <article
            key={`${team.id}-slot-${index + 1}`}
            className={`rounded-[1.25rem] border bg-[var(--surface-container-lowest)] p-5 ${
              memberIssues.length > 0
                ? "border-[var(--error)]/40"
                : "border-[var(--outline-variant)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold">Slot {index + 1}</h3>
              <div className="flex gap-2">
                {memberIssues.length > 0 ? (
                  <span className="rounded-full bg-[var(--error-container)] px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--error)]">
                    Needs Fix
                  </span>
                ) : null}
                <span className="rounded-full bg-[var(--surface-container-low)] px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--outline)]">
                  {member.name ? "Active" : "Empty"}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-[1.25rem] bg-[var(--surface-container-low)] p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white shadow-sm">
                  {member.name.trim() ? (
                    <Image
                      alt={member.name}
                      className="object-contain p-2"
                      fill
                      sizes="80px"
                      src={getPokemonImageUrl(member.name)}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[var(--outline)]">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-headline text-base font-bold">
                    {member.name.trim() || "Empty Slot"}
                  </div>
                  <div className="mt-1 text-sm text-[var(--on-surface-variant)]">
                    {member.name.trim()
                      ? "Image loads dynamically from the web based on species name."
                      : "Add a species name to fetch a live sprite preview."}
                  </div>
                </div>
              </div>
            </div>

            {memberIssues.length > 0 ? (
              <div className="mt-4 space-y-2 rounded-[1rem] bg-[var(--error-container)]/55 p-3">
                {memberIssues.map((issue) => (
                  <p key={issue} className="text-sm font-medium text-[var(--error)]">
                    {issue}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Species
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-[var(--outline-variant)] bg-white px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
                  onChange={(event) =>
                    updateMember(index, { ...member, name: event.target.value })
                  }
                  placeholder="Flutter Mane"
                  value={member.name}
                />
              </label>

              <label className="block">
                <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Item
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-[var(--outline-variant)] bg-white px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
                  onChange={(event) =>
                    updateMember(index, { ...member, item: event.target.value })
                  }
                  placeholder="Focus Sash"
                  value={member.item}
                />
              </label>

              <label className="block">
                <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Ability
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-[var(--outline-variant)] bg-white px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
                  onChange={(event) =>
                    updateMember(index, { ...member, ability: event.target.value })
                  }
                  placeholder="Protosynthesis"
                  value={member.ability}
                />
              </label>

              <ChipListInput
                items={member.types}
                label="Types"
                maxItems={2}
                onChange={(nextTypes) =>
                  updateMember(index, {
                    ...member,
                    types: nextTypes
                  })
                }
                placeholder="Ghost"
              />

              <ChipListInput
                items={member.moves}
                label="Moves"
                maxItems={4}
                onChange={(nextMoves) =>
                  updateMember(index, {
                    ...member,
                    moves: nextMoves
                  })
                }
                placeholder="Moonblast"
              />

              <label className="block">
                <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Role
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-[var(--outline-variant)] bg-white px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
                  onChange={(event) =>
                    updateMember(index, { ...member, role: event.target.value })
                  }
                  placeholder="Speed control"
                  value={member.role}
                />
              </label>

              <label className="block">
                <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                  Tera Type
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-[var(--outline-variant)] bg-white px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
                  onChange={(event) =>
                    updateMember(index, { ...member, teraType: event.target.value })
                  }
                  placeholder="Fairy"
                  value={member.teraType ?? ""}
                />
              </label>

              <div className="flex gap-3">
                <button
                  className="rounded-xl bg-[var(--surface-container-low)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--primary)]"
                  onClick={() => updateMember(index, emptyMember())}
                  type="button"
                >
                  Clear Slot
                </button>
              </div>
            </div>
          </article>
            );
          })()
        ))}
      </div>
    </section>
  );
}
