"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { getSmogonSet, searchPokemon, updateTeam, validateShowdownTeam } from "@/lib/api";
import { ChipListInput } from "@/components/chip-list-input";
import {
  getPokemonImageUrl,
  getPokemonSpeciesAliasHint,
  getPokemonSpeciesIdentity,
  getSmogonDexUrl,
  getSmogonSearchUrl,
  normalizePokemonSlot
} from "@/lib/pokemon";
import { PokemonSearchResult, PokemonSlot, SmogonSet, ShowdownValidation, Team } from "@/lib/types";

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

  const speciesIdentity = getPokemonSpeciesIdentity(member.name);
  if (speciesIdentity) {
    const duplicateCount = allMembers.filter(
      (candidate) => getPokemonSpeciesIdentity(candidate.name) === speciesIdentity
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
  const [validationStatus, setValidationStatus] = useState<"idle" | "checking" | "error">("idle");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [showdownValidation, setShowdownValidation] = useState<ShowdownValidation | null>(null);
  const [speciesSuggestions, setSpeciesSuggestions] = useState<Record<number, PokemonSearchResult[]>>({});
  const [speciesSearchErrors, setSpeciesSearchErrors] = useState<Record<number, string>>({});
  const [smogonPreview, setSmogonPreview] = useState<Record<number, SmogonSet | null>>({});
  const [smogonStatus, setSmogonStatus] = useState<Record<number, "idle" | "loading" | "error">>({});
  const [smogonErrors, setSmogonErrors] = useState<Record<number, string>>({});
  const speciesSearchRequestIds = useRef<Record<number, number>>({});
  const smogonRequestIds = useRef<Record<number, number>>({});

  function updateMember(index: number, nextMember: PokemonSlot) {
    setMembers((current) =>
      current.map((member, memberIndex) => (memberIndex === index ? nextMember : member))
    );
  }

  async function handleSpeciesInputChange(index: number, value: string) {
    updateMember(index, { ...members[index], name: value });
    setSmogonPreview((current) => ({ ...current, [index]: null }));
    setSmogonErrors((current) => ({ ...current, [index]: "" }));

    const query = value.trim();
    if (query.length < 2) {
      setSpeciesSuggestions((current) => ({ ...current, [index]: [] }));
      setSpeciesSearchErrors((current) => ({ ...current, [index]: "" }));
      return;
    }

    const requestId = (speciesSearchRequestIds.current[index] ?? 0) + 1;
    speciesSearchRequestIds.current[index] = requestId;
    setSpeciesSearchErrors((current) => ({ ...current, [index]: "" }));

    try {
      const results = await searchPokemon(query);
      if (speciesSearchRequestIds.current[index] !== requestId) {
        return;
      }
      setSpeciesSuggestions((current) => ({ ...current, [index]: results }));
    } catch (caughtError) {
      if (speciesSearchRequestIds.current[index] !== requestId) {
        return;
      }
      setSpeciesSearchErrors((current) => ({
        ...current,
        [index]: caughtError instanceof Error ? caughtError.message : "Search failed",
      }));
      setSpeciesSuggestions((current) => ({ ...current, [index]: [] }));
    }
  }

  function applySpeciesSuggestion(index: number, species: string) {
    updateMember(index, { ...members[index], name: species });
    setSpeciesSuggestions((current) => ({ ...current, [index]: [] }));
    setSpeciesSearchErrors((current) => ({ ...current, [index]: "" }));
  }

  async function handleLoadSmogonSet(index: number) {
    const species = members[index]?.name.trim();
    if (!species) {
      return;
    }

    const requestId = (smogonRequestIds.current[index] ?? 0) + 1;
    smogonRequestIds.current[index] = requestId;
    setSmogonStatus((current) => ({ ...current, [index]: "loading" }));
    setSmogonErrors((current) => ({ ...current, [index]: "" }));

    try {
      const smogonSet = await getSmogonSet(species);
      if (smogonRequestIds.current[index] !== requestId) {
        return;
      }

      const currentMember = members[index];
      updateMember(index, {
        ...currentMember,
        name: smogonSet.species,
        item: smogonSet.item ?? "",
        ability: smogonSet.ability ?? "",
        types: smogonSet.types,
        moves: smogonSet.moves,
        role: currentMember.role.trim() || smogonSet.setName,
        teraType: smogonSet.teraType ?? "",
        image: getPokemonImageUrl(smogonSet.species),
      });
      setSmogonPreview((current) => ({ ...current, [index]: smogonSet }));
      setSmogonStatus((current) => ({ ...current, [index]: "idle" }));
      setSpeciesSuggestions((current) => ({ ...current, [index]: [] }));
    } catch (caughtError) {
      if (smogonRequestIds.current[index] !== requestId) {
        return;
      }
      setSmogonStatus((current) => ({ ...current, [index]: "error" }));
      setSmogonErrors((current) => ({
        ...current,
        [index]: caughtError instanceof Error ? caughtError.message : "Smogon lookup failed",
      }));
    }
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
        playbook: team.playbook,
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

  async function handleShowdownCheck() {
    setValidationStatus("checking");
    setValidationError("");

    try {
      const cleanedMembers = members
        .filter((member) => member.name.trim())
        .map((member) => normalizePokemonSlot(member));

      const result = await validateShowdownTeam({
        format: team.format,
        members: cleanedMembers
      });
      setShowdownValidation(result);
      setValidationStatus("idle");
    } catch (caughtError) {
      setValidationStatus("error");
      setValidationError(
        caughtError instanceof Error ? caughtError.message : "Failed to validate with Showdown"
      );
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
        <button
          className="rounded-2xl bg-[var(--secondary-fixed)] px-5 py-3 font-headline text-sm font-bold text-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={validationStatus === "checking"}
          onClick={handleShowdownCheck}
          type="button"
        >
          {validationStatus === "checking" ? "Checking Showdown..." : "Showdown Check"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-[var(--error)]">{error}</p> : null}
      {validationError ? (
        <p className="mt-2 text-sm font-semibold text-[var(--error)]">{validationError}</p>
      ) : null}

      {showdownValidation ? (
        <div className="mt-6 rounded-[1.25rem] bg-[var(--surface-container-low)] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="font-headline text-xl font-bold">Showdown Validation</div>
              <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                Requested format: {showdownValidation.formatRequested} • Resolved format:{" "}
                {showdownValidation.formatResolved}
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.2em] ${
                showdownValidation.valid
                  ? "bg-[var(--secondary-fixed)] text-[var(--secondary)]"
                  : "bg-[var(--error-container)] text-[var(--error)]"
              }`}
            >
              {showdownValidation.valid ? "Valid" : "Issues Found"}
            </span>
          </div>

          {showdownValidation.issues.length > 0 ? (
            <div className="mt-4 space-y-2">
              {showdownValidation.issues.map((issue) => (
                <p
                  key={issue}
                  className="rounded-xl bg-[var(--error-container)]/70 px-4 py-3 text-sm text-[var(--on-surface)]"
                >
                  {issue}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-medium text-[var(--on-surface-variant)]">
              Showdown accepted the current export with the resolved validation format.
            </p>
          )}

          <details className="mt-4 rounded-xl bg-white p-4">
            <summary className="cursor-pointer font-headline text-sm font-bold text-[var(--primary)]">
              View exported team text
            </summary>
            <pre className="mt-3 whitespace-pre-wrap text-xs text-[var(--on-surface-variant)]">
              {showdownValidation.exportedTeam}
            </pre>
          </details>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member, index) => (
          (() => {
            const memberIssues = validateMember(member, members);
            const speciesAliasHint = getPokemonSpeciesAliasHint(member.name);
            const suggestions = speciesSuggestions[index] ?? [];
            const loadedSmogonSet = smogonPreview[index];
            const smogonLookupStatus = smogonStatus[index] ?? "idle";

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
                  onChange={(event) => void handleSpeciesInputChange(index, event.target.value)}
                  placeholder="Flutter Mane"
                  value={member.name}
                />
                {speciesAliasHint ? (
                  <p className="mt-2 text-xs text-[var(--on-surface-variant)]">{speciesAliasHint}</p>
                ) : null}
                {speciesSearchErrors[index] ? (
                  <p className="mt-2 text-xs font-medium text-[var(--error)]">{speciesSearchErrors[index]}</p>
                ) : null}
                {suggestions.length > 0 ? (
                  <div className="mt-3 space-y-2 rounded-xl bg-[var(--surface-container-low)] p-3">
                    <div className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
                      Pokemon Search
                    </div>
                    {suggestions.map((result) => (
                      <button
                        key={`${index}-${result.name}`}
                        className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-left transition hover:bg-[var(--secondary-fixed)]/50"
                        onClick={() => applySpeciesSuggestion(index, result.name)}
                        type="button"
                      >
                        <span>
                          <span className="block text-sm font-semibold text-[var(--on-surface)]">{result.name}</span>
                          <span className="block text-xs text-[var(--on-surface-variant)]">
                            {result.types.join(" / ") || "Type data unavailable"}
                          </span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
                          {result.smogonSetAvailable ? "Smogon Set" : "Species"}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
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
                {member.name.trim() ? (
                  <button
                    className="rounded-xl bg-[var(--primary-container)] px-4 py-2.5 font-headline text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={smogonLookupStatus === "loading"}
                    onClick={() => void handleLoadSmogonSet(index)}
                    type="button"
                  >
                    {smogonLookupStatus === "loading" ? "Loading Set..." : "Load Smogon Set"}
                  </button>
                ) : null}
                {member.name.trim() ? (
                  <a
                    className="rounded-xl bg-[var(--secondary-fixed)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--secondary)]"
                    href={getSmogonDexUrl(member.name)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Smogon Dex
                  </a>
                ) : null}
                {member.name.trim() ? (
                  <a
                    className="rounded-xl bg-white px-4 py-2.5 font-headline text-sm font-bold text-[var(--secondary)] ring-1 ring-[var(--outline-variant)]"
                    href={getSmogonSearchUrl(member.name)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Smogon Search
                  </a>
                ) : null}
              </div>
              {smogonErrors[index] ? (
                <p className="text-sm font-semibold text-[var(--error)]">{smogonErrors[index]}</p>
              ) : null}
              {loadedSmogonSet ? (
                <div className="rounded-[1rem] bg-[var(--surface-container-low)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-headline text-sm font-bold text-[var(--on-surface)]">
                        {loadedSmogonSet.setName}
                      </div>
                      <p className="mt-1 text-xs text-[var(--on-surface-variant)]">
                        {loadedSmogonSet.format}
                        {loadedSmogonSet.item ? ` • ${loadedSmogonSet.item}` : ""}
                        {loadedSmogonSet.ability ? ` • ${loadedSmogonSet.ability}` : ""}
                      </p>
                    </div>
                    <a
                      className="text-xs font-semibold text-[var(--secondary)] underline-offset-4 hover:underline"
                      href={loadedSmogonSet.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View Source
                    </a>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {loadedSmogonSet.moves.map((move) => (
                      <span
                        key={`${loadedSmogonSet.species}-${loadedSmogonSet.setName}-${move}`}
                        className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)]"
                      >
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </article>
            );
          })()
        ))}
      </div>
    </section>
  );
}
