"use client";

import Link from "next/link";
import { useState } from "react";

type ParsedPokemon = {
  name: string;
  item?: string | null;
  ability?: string | null;
  nature?: string | null;
  tera_type?: string | null;
  moves: string[];
};

type ImportResponse = {
  team_name: string;
  format: string;
  pokemon: ParsedPokemon[];
};

const starterImport = `Flutter Mane @ Focus Sash
Ability: Protosynthesis
Tera Type: Fairy
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Moonblast
- Shadow Ball
- Icy Wind
- Protect

Incineroar @ Sitrus Berry
Ability: Intimidate
Tera Type: Grass
EVs: 236 HP / 4 Atk / 116 Def / 4 SpD / 148 Spe
Careful Nature
- Fake Out
- Flare Blitz
- Parting Shot
- Knock Off`;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function ShowdownImportPanel() {
  const [teamName, setTeamName] = useState("Ladder Prep");
  const [format, setFormat] = useState("Regulation H");
  const [showdownText, setShowdownText] = useState(starterImport);
  const [parsed, setParsed] = useState<ImportResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleImport() {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/teams/import-showdown`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: teamName,
          format,
          showdown_text: showdownText
        })
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      const data: ImportResponse = await response.json();
      setParsed(data);
      setStatus("idle");
    } catch (caughtError) {
      setStatus("error");
      setError(caughtError instanceof Error ? caughtError.message : "Import failed");
    }
  }

  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-sm" id="import-lab">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-xl font-bold">Showdown Import Lab</h2>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
            Paste a team export and inspect the parsed sets before saving them.
          </p>
        </div>
        <span className="material-symbols-outlined text-[var(--primary)]">upload_file</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
            Team name
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
            onChange={(event) => setTeamName(event.target.value)}
            value={teamName}
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
      </div>

      <label className="mt-4 block">
        <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
          Showdown export
        </span>
        <textarea
          className="mt-2 min-h-64 w-full rounded-[1.25rem] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 outline-none transition focus:border-[var(--secondary)]"
          onChange={(event) => setShowdownText(event.target.value)}
          value={showdownText}
        />
      </label>

      <div className="mt-4 flex items-center gap-3">
        <button
          className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-5 py-3 font-headline text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70"
          disabled={status === "loading"}
          onClick={handleImport}
          type="button"
        >
          {status === "loading" ? "Parsing..." : "Parse Showdown Team"}
        </button>
        {error ? (
          <p className="text-sm font-semibold text-[var(--error)]">{error}</p>
        ) : (
          <p className="text-sm text-[var(--on-surface-variant)]">
            Current parser handles names, items, abilities, tera types, EVs, IVs, nature, and moves.
          </p>
        )}
      </div>

      {parsed ? (
        <div className="mt-6 rounded-[1.25rem] bg-[var(--surface-container-low)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-headline text-lg font-bold">{parsed.team_name}</h3>
              <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{parsed.format}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
              {parsed.pokemon.length} parsed
            </span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {parsed.pokemon.map((pokemon) => (
              <article key={pokemon.name} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-headline text-base font-bold">{pokemon.name}</h4>
                    <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                      {[pokemon.item, pokemon.ability].filter(Boolean).join(" | ") || "No item or ability parsed"}
                    </p>
                  </div>
                  {pokemon.tera_type ? (
                    <span className="rounded-full bg-[var(--secondary-fixed)] px-2 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                      Tera {pokemon.tera_type}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pokemon.moves.map((move) => (
                    <span
                      key={`${pokemon.name}-${move}`}
                      className="rounded-full bg-[var(--surface-container-low)] px-2.5 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)]"
                    >
                      {move}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <Link
              className="rounded-xl bg-[var(--secondary-fixed)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--secondary)]"
              href="/teams"
            >
              View Teams Workspace
            </Link>
            <Link
              className="rounded-xl bg-[var(--surface-container-lowest)] px-4 py-2.5 font-headline text-sm font-bold text-[var(--primary)]"
              href="/analysis"
            >
              Open Analysis
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
