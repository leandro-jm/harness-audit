import type { RunOptions } from "../core/types.js";
import type { RepoContext } from "../context/repo-context.js";
import { loadRepoContext } from "../context/repo-context.js";
import { runAudit } from "./run-audit.js";
import { t } from "../i18n/index.js";
import { colors } from "../util/colors.js";
import { formatScore } from "../util/format.js";

const SCORE_FILE = "harness-score.json";
const SPARK = "▁▂▃▄▅▆▇█";

export interface TrendPoint {
  shortSha: string;
  date: string; // YYYY-MM-DD
  global: number;
  level: string;
}

function epochToDate(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

/**
 * Trend histórico do score, lido dos harness-score.json JÁ COMMITADOS via
 * `git show <rev>:file` — zero checkout, 100% leitura. Requer que o time commite
 * o score ao longo do tempo (complementa o --badge / --json). Oldest→newest.
 */
export async function buildTrend(ctx: RepoContext, file = SCORE_FILE): Promise<TrendPoint[]> {
  const commits = await ctx.git.fileHistory([file]); // newest→oldest
  const points: TrendPoint[] = [];
  for (const c of commits) {
    const raw = await ctx.git.showFile(c.sha, file);
    if (raw == null) continue;
    try {
      const j = JSON.parse(raw) as { score?: { global?: unknown; level?: unknown } };
      const g = j.score?.global;
      if (typeof g === "number") {
        points.push({
          shortSha: c.sha.slice(0, 7),
          date: epochToDate(c.committedAt),
          global: g,
          level: typeof j.score?.level === "string" ? j.score.level : "",
        });
      }
    } catch {
      // JSON inválido naquela revisão → ignora o ponto.
    }
  }
  return points.reverse();
}

function sparkline(values: number[]): string {
  return values
    .map((v) => SPARK[Math.max(0, Math.min(SPARK.length - 1, Math.round((v / 4) * (SPARK.length - 1))))])
    .join("");
}

export function renderTrend(points: TrendPoint[], current: number): string {
  const L: string[] = [];
  L.push(colors.bold(t("history.title")));
  if (points.length === 0) {
    L.push(colors.dim(t("history.empty")));
  } else {
    for (let i = 0; i < points.length; i++) {
      const p = points[i]!;
      const prev = i > 0 ? points[i - 1]!.global : null;
      const delta = prev == null ? "" : colors.dim(` (${p.global >= prev ? "+" : "−"}${Math.abs(Math.round((p.global - prev) * 10) / 10).toFixed(1).replace(".", ",")})`);
      L.push(` ${p.date}  ${formatScore(p.global)}  ${colors.dim(p.shortSha)}${delta}`);
    }
    L.push("");
    L.push(" " + colors.cyan(sparkline([...points.map((p) => p.global), current])));
  }
  L.push(colors.dim(t("history.current", { score: formatScore(current) })));
  return L.join("\n");
}

/** Orquestra `--history`: trend commitado + score atual como ponta. */
export async function runHistory(options: RunOptions): Promise<number> {
  const ctx = await loadRepoContext(options);
  if (!ctx.git.isRepo) {
    process.stderr.write(t("detect.noGit", { path: ctx.root }) + "\n");
    return 2;
  }
  const trend = await buildTrend(ctx);
  ctx.selfReport = { answered: false };
  const { score } = await runAudit(ctx);
  process.stdout.write(renderTrend(trend, score.global) + "\n");
  return 0;
}
