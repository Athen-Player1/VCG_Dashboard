"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { activateMetaSnapshot, createMetaSnapshot, importVictoryRoadSnapshot } from "@/lib/api";
import { MetaSnapshot } from "@/lib/types";

const sampleTemplate = `{
  "id": "reg-i-sample-2026-04-04",
  "format": "Regulation I Snapshot",
  "source": "Manual import",
  "snapshotDate": "2026-04-04",
  "active": false,
  "weaknessSummary": ["Add notes here"],
  "recommendations": ["Add recommendations here"],
  "threats": [
    {
      "name": "Incineroar",
      "threatLevel": "High",
      "reason": "Pivot cycling and Fake Out pressure.",
      "counterplay": "Preserve your anti-pivot tools."
    }
  ],
  "metaTeams": [
    {
      "id": "sample-team",
      "name": "Sample Balance",
      "format": "Regulation I Snapshot",
      "archetype": "Balance",
      "core": ["Incineroar", "Rillaboom"],
      "pressurePoints": ["pivot attrition", "fake out pressure"],
      "plan": ["Document the default game plan here."]
    }
  ]
}`;

export function SnapshotManagementPanel({ snapshots }: { snapshots: MetaSnapshot[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState(sampleTemplate);
  const [victoryRoadUrl, setVictoryRoadUrl] = useState("");
  const [victoryRoadFormat, setVictoryRoadFormat] = useState("Regulation I Snapshot");
  const [victoryRoadDate, setVictoryRoadDate] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function handleCreateSnapshot() {
    setStatus("saving");
    setError("");

    try {
      const parsed = JSON.parse(draft) as MetaSnapshot;
      await createMetaSnapshot(parsed);
      setStatus("idle");
      router.refresh();
    } catch (caughtError) {
      setStatus("error");
      setError(caughtError instanceof Error ? caughtError.message : "Failed to create snapshot");
    }
  }

  async function handleActivate(snapshotId: string) {
    setStatus("saving");
    setError("");

    try {
      await activateMetaSnapshot(snapshotId);
      setStatus("idle");
      router.refresh();
    } catch (caughtError) {
      setStatus("error");
      setError(caughtError instanceof Error ? caughtError.message : "Failed to activate snapshot");
    }
  }

  async function handleVictoryRoadImport() {
    setStatus("saving");
    setError("");

    try {
      await importVictoryRoadSnapshot({
        url: victoryRoadUrl,
        format: victoryRoadFormat,
        snapshotDate: victoryRoadDate || undefined,
        active: false
      });
      setStatus("idle");
      setVictoryRoadUrl("");
      setVictoryRoadDate("");
      router.refresh();
    } catch (caughtError) {
      setStatus("error");
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to import Victory Road snapshot"
      );
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article id="snapshot-library" className="rounded-[1.5rem] bg-white p-8 shadow-sm">
        <h2 className="font-headline text-2xl font-bold">Snapshot Library</h2>
        <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
          Activate a stored snapshot or keep multiple dated formats side by side.
        </p>
        <div className="mt-6 space-y-3">
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="rounded-2xl bg-[var(--surface-container-low)] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-headline text-lg font-bold">{snapshot.format}</div>
                  <div className="mt-1 text-sm text-[var(--on-surface-variant)]">
                    {snapshot.snapshotDate} • {snapshot.source}
                  </div>
                </div>
                {snapshot.active ? (
                  <span className="rounded-full bg-[var(--secondary-fixed)] px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                    Active
                  </span>
                ) : (
                  <button
                    className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[var(--primary)]"
                    disabled={status === "saving"}
                    onClick={() => handleActivate(snapshot.id)}
                    type="button"
                  >
                    Activate
                  </button>
                )}
              </div>
              <div className="mt-3 text-xs text-[var(--outline)]">{snapshot.id}</div>
            </div>
          ))}
        </div>
      </article>

      <article id="import-snapshot" className="rounded-[1.5rem] bg-white p-8 shadow-sm">
        <h2 className="font-headline text-2xl font-bold">Import Snapshot JSON</h2>
        <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
          Paste a dated snapshot payload to load a new format or update your local meta set.
        </p>
        {error ? <p className="mt-4 text-sm font-semibold text-[var(--error)]">{error}</p> : null}
        <textarea
          className="mt-6 min-h-80 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 font-mono text-xs outline-none focus:border-[var(--secondary)]"
          onChange={(event) => setDraft(event.target.value)}
          value={draft}
        />
        <button
          className="mt-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] px-6 py-3 font-headline text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "saving"}
          onClick={handleCreateSnapshot}
          type="button"
        >
          {status === "saving" ? "Saving Snapshot..." : "Create Snapshot"}
        </button>

        <div id="victory-road-import" className="mt-8 border-t border-[var(--outline-variant)] pt-8">
          <h3 className="font-headline text-xl font-bold">Import From Victory Road</h3>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            Tournament-result pages are the best automation target for dated snapshots. Paste a
            Victory Road event URL and the app will build a snapshot from the top-cut table.
          </p>
          <div className="mt-5 space-y-4">
            <input
              className="w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-sm outline-none focus:border-[var(--secondary)]"
              onChange={(event) => setVictoryRoadUrl(event.target.value)}
              placeholder="https://victoryroad.pro/2026-seville/"
              value={victoryRoadUrl}
            />
            <input
              className="w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-sm outline-none focus:border-[var(--secondary)]"
              onChange={(event) => setVictoryRoadFormat(event.target.value)}
              placeholder="Regulation I Snapshot"
              value={victoryRoadFormat}
            />
            <input
              className="w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-sm outline-none focus:border-[var(--secondary)]"
              onChange={(event) => setVictoryRoadDate(event.target.value)}
              placeholder="2026-04-05 (optional override)"
              value={victoryRoadDate}
            />
            <button
              className="rounded-2xl bg-[var(--secondary-fixed)] px-6 py-3 font-headline text-sm font-bold text-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={status === "saving" || !victoryRoadUrl.trim() || !victoryRoadFormat.trim()}
              onClick={handleVictoryRoadImport}
              type="button"
            >
              {status === "saving" ? "Importing..." : "Import Victory Road Snapshot"}
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
