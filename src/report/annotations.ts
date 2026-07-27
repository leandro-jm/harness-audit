import { t } from "../i18n/index.js";
import type { AuditResult } from "../app/run-audit.js";
import type { CheckResult } from "../checks/types.js";
import { recommendationFor } from "../recommendations/catalog.js";
import { formatScore } from "../util/format.js";

/** Gaps (lacunas) do audit: checks com recomendação (measured<max ou not-prepared). */
export function gapResults(audit: AuditResult): CheckResult[] {
  return audit.score.dimensions.flatMap((d) => d.results).filter((r) => r.recommendationId != null);
}

// Escapes dos workflow commands do GitHub Actions.
function escData(s: string): string {
  return s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escProp(s: string): string {
  return escData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
}

function gapMessage(r: CheckResult): string {
  if (r.summaryKey) return t(r.summaryKey, r.summaryParams);
  const rec = recommendationFor(r.checkId);
  return rec ? t(rec.textKey) : t(`check.${r.checkId}.title`);
}

/**
 * Anotações de PR no formato de workflow commands do GitHub Actions
 * (`::warning ...`). Cada lacuna vira uma anotação inline; o score vira `::notice`.
 */
export function renderGithubAnnotations(audit: AuditResult): string {
  const lines: string[] = [];
  lines.push(
    `::notice title=${escProp("Harness Score")}::` +
      escData(
        t("annotation.score", {
          score: formatScore(audit.score.global),
          level: t(`level.${audit.score.level}`),
        }),
      ),
  );
  for (const r of gapResults(audit)) {
    const title = `${r.recommendationId} ${t(`check.${r.checkId}.title`)}`;
    const ev = r.evidences.find((e) => e.file != null);
    const loc = ev?.file ? `file=${escProp(ev.file)},${ev.line ? `line=${ev.line},` : ""}` : "";
    lines.push(`::warning ${loc}title=${escProp(title)}::${escData(gapMessage(r))}`);
  }
  return lines.join("\n");
}
