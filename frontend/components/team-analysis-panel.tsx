import { TypeMatrixPanel } from "@/components/type-matrix-panel";
import { RecommendationDetail, TeamAnalysis } from "@/lib/types";

function statusClasses(status: string) {
  if (status === "ready") {
    return "bg-[var(--secondary-fixed)] text-[var(--secondary)]";
  }

  return "bg-[var(--error-container)] text-[var(--error)]";
}

export function TeamAnalysisPanel({ analysis }: { analysis: TeamAnalysis }) {
  const recommendationDetails =
    analysis.recommendation_details?.length > 0
      ? analysis.recommendation_details
      : analysis.recommendations.map(
          (item): RecommendationDetail => ({
            summary: item,
            category: "general",
            severity: "medium",
            confidence: 70,
            evidence: [],
            affectedMembers: [],
            suggestedFix: item
          })
        );

  return (
    <section className="space-y-6 rounded-[1.5rem] bg-[var(--surface-container-low)] p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="font-label text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--secondary)]">
            Deterministic Analysis
          </div>
          <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight">
            Structural Readout
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--on-surface-variant)]">
            First-pass team diagnostics based on saved slots, type coverage, and visible support
            tools.
          </p>
        </div>
        <div className="rounded-2xl bg-white px-5 py-4 text-right shadow-sm">
          <div className="font-label text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--outline)]">
            Filled Slots
          </div>
          <div className="mt-1 font-headline text-3xl font-extrabold">
            {analysis.filled_slots}
            <span className="text-lg text-[var(--outline)]"> / 6</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analysis.metrics.map((metric) => (
          <article key={metric.label} className="rounded-[1.25rem] bg-white p-5 shadow-sm">
            <div className="font-label text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--outline)]">
              {metric.label}
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div className="font-headline text-4xl font-extrabold">{metric.grade}</div>
              <div className="text-sm font-bold text-[var(--secondary)]">{metric.score}/100</div>
            </div>
            <p className="mt-3 text-sm text-[var(--on-surface-variant)]">{metric.summary}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-[1.25rem] bg-white p-6 shadow-sm">
          <div>
            <h3 className="font-headline text-xl font-bold">Pressure Points</h3>
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
              These are the attack types currently hitting multiple members for super-effective
              damage.
            </p>
          </div>
          <div className="space-y-3">
            {analysis.shared_weaknesses.length > 0 ? (
              analysis.shared_weaknesses.map((weakness) => (
                <div
                  key={weakness.type}
                  className="flex items-center justify-between rounded-2xl bg-[var(--surface-container-low)] px-4 py-3"
                >
                  <div>
                    <div className="font-headline text-base font-bold">{weakness.type}</div>
                    <div className="mt-1 text-xs text-[var(--on-surface-variant)]">
                      {weakness.weak_count} weak • {weakness.resist_count} resist •{" "}
                      {weakness.immune_count} immune
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--error-container)] px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--error)]">
                    Watch
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-[var(--secondary-fixed)] px-4 py-4 text-sm font-semibold text-[var(--secondary)]">
                No major multi-member weakness stack was detected in the current type profile.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.25rem] bg-white p-6 shadow-sm">
            <h3 className="font-headline text-xl font-bold">Coverage Checks</h3>
            <div className="mt-4 space-y-3">
              {analysis.coverage_checks.map((check) => (
                <div
                  key={check.label}
                  className="rounded-2xl bg-[var(--surface-container-low)] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-headline text-base font-bold">{check.label}</div>
                    <span
                      className={`rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] ${statusClasses(check.status)}`}
                    >
                      {check.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">{check.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.25rem] bg-white p-6 shadow-sm">
            <h3 className="font-headline text-xl font-bold">Best Defensive Buckets</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {analysis.defensive_benchmarks.length > 0 ? (
                analysis.defensive_benchmarks.map((entry) => (
                  <span
                    key={entry.type}
                    className="rounded-full bg-[var(--surface-container-low)] px-4 py-2 text-sm font-semibold text-[var(--on-surface-variant)]"
                  >
                    {entry.type} • {entry.resist_count + entry.immune_count} answers
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--on-surface-variant)]">
                  No standout defensive bucket yet.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <TypeMatrixPanel analysis={analysis} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[1.25rem] bg-white p-6 shadow-sm">
          <h3 className="font-headline text-xl font-bold">Strengths</h3>
          <div className="mt-4 space-y-3">
            {analysis.strengths.map((item) => (
              <p
                key={item}
                className="rounded-2xl bg-[var(--secondary-fixed)]/60 px-4 py-3 text-sm font-medium text-[var(--on-surface)]"
              >
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] bg-white p-6 shadow-sm">
          <h3 className="font-headline text-xl font-bold">Warnings</h3>
          <div className="mt-4 space-y-3">
            {analysis.warnings.map((item) => (
              <p
                key={item}
                className="rounded-2xl bg-[var(--error-container)]/70 px-4 py-3 text-sm font-medium text-[var(--on-surface)]"
              >
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] bg-white p-6 shadow-sm">
          <h3 className="font-headline text-xl font-bold">Recommendations</h3>
          <div className="mt-4 space-y-3">
            {recommendationDetails.map((item) => (
              <article
                key={`${item.category}-${item.summary}`}
                className="rounded-2xl bg-[var(--surface-container-low)] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-headline text-base font-bold text-[var(--on-surface)]">
                    {item.summary}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--outline)]">
                      {item.category}
                    </span>
                    <span className="rounded-full bg-[var(--secondary-fixed)] px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                      {item.severity}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
                  {item.suggestedFix}
                </p>
                {item.evidence.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.evidence.map((evidence) => (
                      <span
                        key={evidence}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--on-surface-variant)]"
                      >
                        {evidence}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--outline)]">
                  <span>Confidence {item.confidence}%</span>
                  {item.affectedMembers.length > 0 ? (
                    <span>Affects {item.affectedMembers.join(", ")}</span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
