import { t } from "../i18n/index.js";
import { VERSION, NAME } from "../version.js";
import type { RepoContext } from "../context/repo-context.js";
import type { AuditResult } from "../app/run-audit.js";
import { topGaps } from "../scoring/gaps.js";
import { recommendationFor } from "../recommendations/catalog.js";

/** Contrato de máquina (harness-score.json). Bump em `schemaVersion` a cada mudança de forma. */
export const SCHEMA_VERSION = "1.0.0";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildScoreJson(
  ctx: RepoContext,
  audit: AuditResult,
  generatedAt: string,
): Record<string, unknown> {
  const { score } = audit;
  const allResults = score.dimensions.flatMap((d) => d.results);

  const recommendations = collectRecommendations(allResults);

  return {
    schemaVersion: SCHEMA_VERSION,
    tool: { name: NAME, version: VERSION },
    generatedAt,
    repo: {
      name: ctx.git.repoName,
      branch: ctx.git.branch,
      commitCount: ctx.git.commitCount,
      profile: ctx.profile,
    },
    stack: {
      primary: ctx.stack.primary,
      packageManager: ctx.stack.packageManager,
      ci: ctx.ci.provider,
    },
    score: {
      global: round2(score.global),
      level: score.level,
      confidence: score.confidence,
      dimensions: score.dimensions.map((d) => ({
        id: d.dimension,
        name: t(`dim.${d.dimension}`),
        score: d.score === null ? null : round2(d.score),
        pointsObtained: d.pointsObtained,
        pointsApplicable: d.pointsApplicable,
        seals: d.seals,
        checks: d.results.map((r) => ({
          id: r.checkId,
          status: r.status,
          seal: r.seal,
          points: r.points,
          max: r.max,
          recommendationId: r.recommendationId ?? null,
          evidences: r.evidences.map((e) => ({
            file: e.file ?? null,
            line: e.line ?? null,
            kind: e.kind,
            detail: t(e.detailKey, e.params),
          })),
        })),
      })),
    },
    topGaps: topGaps(allResults, 3).map((g, i) => ({
      rank: i + 1,
      checkId: g.result.checkId,
      recommendationId: g.recommendationId,
      summary: g.result.summaryKey
        ? t(g.result.summaryKey, g.result.summaryParams)
        : t(`check.${g.result.checkId}.title`),
    })),
    recommendations,
  };
}

function collectRecommendations(
  results: { checkId: string; recommendationId?: string }[],
): Array<Record<string, unknown>> {
  const seen = new Set<string>();
  const out: Array<Record<string, unknown>> = [];
  for (const r of results) {
    if (!r.recommendationId || seen.has(r.recommendationId)) continue;
    seen.add(r.recommendationId);
    const rec = recommendationFor(r.checkId);
    if (!rec) continue;
    out.push({
      id: rec.id,
      checkId: rec.checkId,
      source: rec.source,
      sourceLabel: t(`source.${rec.source}`),
      text: t(rec.textKey),
    });
  }
  return out;
}

export function serializeScoreJson(json: Record<string, unknown>): string {
  return JSON.stringify(json, null, 2) + "\n";
}
