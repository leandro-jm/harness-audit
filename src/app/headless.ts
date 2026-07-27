import type { RunOptions } from "../core/types.js";
import { t } from "../i18n/index.js";
import { loadRepoContext } from "../context/repo-context.js";
import { runAudit, type AuditResult } from "./run-audit.js";
import { renderTerminalReport } from "../report/terminal.js";
import { writeReports, type ExportChoice } from "../report/export.js";
import { evaluateGate } from "./gate.js";
import { loadBaseline, computeDiff, renderDiff } from "../report/diff.js";
import { renderGithubAnnotations } from "../report/annotations.js";
import { buildSarif, serializeSarif } from "../report/sarif.js";
import { buildBadgeSvg, BADGE_FILENAME } from "../report/badge.js";
import { formatScore } from "../util/format.js";
import { colors } from "../util/colors.js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Caminho não-interativo (--json / --out / --ci / --gate): sem prompts. O
 * autorrelato fica "não respondido" e sai do cálculo (semântica de --ci).
 * Escreve relatórios só quando pedidos; aplica o gate quando ligado. Retorna o
 * exit code (0 ok · 1 gate reprovado · 2 não é repo git).
 */
export async function runHeadless(options: RunOptions): Promise<number> {
  const ctx = await loadRepoContext(options);
  if (!ctx.git.isRepo) {
    process.stderr.write(t("detect.noGit", { path: ctx.root }) + "\n");
    return 2;
  }

  ctx.selfReport = { answered: false };
  const audit = await runAudit(ctx);

  // Saída para máquina: emite só o formato pedido (anotações/SARIF), sem o box.
  if (options.format === "github") {
    process.stdout.write(renderGithubAnnotations(audit) + "\n");
    return gateExit(options, audit);
  }
  if (options.format === "sarif") {
    process.stdout.write(serializeSarif(buildSarif(audit)));
    return gateExit(options, audit);
  }

  // Escreve relatórios só se pedido: --out → md+json; --json → só json.
  if (options.out || options.json) {
    const choices: ExportChoice[] = options.out ? ["md", "json"] : ["json"];
    const res = writeReports(ctx, audit, choices, new Date());
    process.stdout.write(renderTerminalReport(audit.score) + "\n\n");
    for (const file of res.writtenFiles) {
      process.stdout.write(t("export.wrote", { file }) + "\n");
    }
  } else {
    process.stdout.write(renderTerminalReport(audit.score) + "\n");
  }

  if (options.badge) {
    const dest = join(options.out ?? ctx.root, BADGE_FILENAME);
    writeFileSync(dest, buildBadgeSvg(audit.score));
    process.stdout.write(t("export.wrote", { file: dest }) + "\n");
  }

  if (options.baseline) {
    const baseline = loadBaseline(options.baseline);
    if (baseline == null) {
      process.stderr.write("\n" + t("diff.notFound", { file: options.baseline }) + "\n");
    } else {
      process.stdout.write("\n" + renderDiff(computeDiff(audit.score, baseline)) + "\n");
    }
  }

  return gateExit(options, audit);
}

/** Aplica o gate (se ligado) e devolve o exit code (0 ok · 1 reprovado). */
function gateExit(options: RunOptions, audit: AuditResult): number {
  if (!options.gate) return 0;
  const gate = evaluateGate(audit.score, options.min);
  const params = { actual: formatScore(gate.actual), min: formatScore(gate.threshold) };
  if (gate.passed) {
    process.stdout.write("\n" + colors.green(t("gate.pass", params)) + "\n");
    return 0;
  }
  process.stderr.write("\n" + colors.red(t("gate.fail", params)) + "\n");
  return 1;
}
