import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { glob } from "tinyglobby";
import type { RunOptions } from "../core/types.js";
import type { MaturityLevel } from "../scoring/types.js";
import { loadRepoContext } from "../context/repo-context.js";
import { runAudit } from "./run-audit.js";
import { t } from "../i18n/index.js";
import { colors } from "../util/colors.js";
import { formatScore, formatPercent } from "../util/format.js";
import { VERSION, NAME } from "../version.js";
import { SCHEMA_VERSION } from "../report/json.js";

export interface OrgRow {
  name: string;
  path: string;
  global: number;
  level: MaturityLevel;
  confidence: number;
}

/** Expande caminhos/globs em diretórios concretos (dedup, ordenado). */
async function expandTargets(paths: string[]): Promise<string[]> {
  const out = new Set<string>();
  for (const p of paths) {
    if (/[*?[\]]/.test(p)) {
      const dirs = await glob(p, { onlyDirectories: true, dot: false });
      for (const d of dirs) out.add(resolve(d));
    } else {
      out.add(resolve(p));
    }
  }
  return [...out].sort();
}

/** Audita cada repositório local e devolve as linhas (ranqueáveis). Zero rede. */
export async function auditRepos(paths: string[], options: RunOptions): Promise<OrgRow[]> {
  const targets = await expandTargets(paths);
  const rows: OrgRow[] = [];
  for (const path of targets) {
    const ctx = await loadRepoContext({ ...options, path });
    if (!ctx.git.isRepo) {
      process.stderr.write(colors.dim(t("org.skip", { path })) + "\n");
      continue;
    }
    ctx.selfReport = { answered: false };
    const { score } = await runAudit(ctx);
    rows.push({
      name: ctx.git.repoName,
      path,
      global: score.global,
      level: score.level,
      confidence: score.confidence,
    });
  }
  rows.sort((a, b) => b.global - a.global);
  return rows;
}

function paint(level: MaturityLevel, text: string): string {
  if (level === "fe" || level === "improviso") return colors.red(text);
  if (level === "instrumentado") return colors.yellow(text);
  return colors.green(text);
}

/** Tabela ranqueada de repositórios (terminal). */
export function renderOrgTable(rows: OrgRow[]): string {
  const L: string[] = [];
  L.push(colors.bold(t("org.title", { n: rows.length })));
  L.push("");
  rows.forEach((r, i) => {
    const rank = String(i + 1).padStart(2);
    const score = formatScore(r.global).padEnd(4);
    const level = paint(r.level, t(`level.${r.level}`).padEnd(14));
    const conf = formatPercent(r.confidence).padStart(4);
    L.push(` ${rank}  ${paint(r.level, score)}  ${level} ${colors.dim(conf)}  ${r.name}`);
  });
  if (rows.length > 0) {
    const avg = rows.reduce((s, r) => s + r.global, 0) / rows.length;
    L.push("");
    L.push(colors.dim(t("org.average", { avg: formatScore(avg) })));
  }
  return L.join("\n");
}

/** Agregado de máquina (harness-org.json) para o modo org. */
export function buildOrgJson(rows: OrgRow[], generatedAt: string): Record<string, unknown> {
  const avg = rows.length ? rows.reduce((s, r) => s + r.global, 0) / rows.length : 0;
  return {
    schemaVersion: SCHEMA_VERSION,
    tool: { name: NAME, version: VERSION },
    generatedAt,
    summary: { repos: rows.length, averageScore: Math.round(avg * 100) / 100 },
    repos: rows.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      path: r.path,
      score: Math.round(r.global * 100) / 100,
      level: r.level,
      confidence: r.confidence,
    })),
  };
}

/** Orquestra o modo org: audita, ranqueia, imprime e (opcional) exporta/gate. */
export async function runOrg(paths: string[], options: RunOptions): Promise<number> {
  if (paths.length === 0) {
    process.stderr.write(t("org.noTargets") + "\n");
    return 2;
  }
  const rows = await auditRepos(paths, options);
  if (rows.length === 0) {
    process.stderr.write(t("org.noTargets") + "\n");
    return 2;
  }

  process.stdout.write(renderOrgTable(rows) + "\n");

  if (options.out || options.json) {
    const dest = join(options.out ?? process.cwd(), "harness-org.json");
    writeFileSync(dest, JSON.stringify(buildOrgJson(rows, new Date().toISOString()), null, 2) + "\n");
    process.stdout.write(t("export.wrote", { file: dest }) + "\n");
  }

  if (options.gate) {
    const min = options.min ?? 2.0;
    const failing = rows.filter((r) => r.global < min);
    if (failing.length > 0) {
      process.stderr.write(
        "\n" + colors.red(t("org.gateFail", { n: failing.length, min: formatScore(min) })) + "\n",
      );
      return 1;
    }
    process.stdout.write("\n" + colors.green(t("org.gatePass", { min: formatScore(min) })) + "\n");
  }
  return 0;
}
