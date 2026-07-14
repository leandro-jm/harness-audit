import { relative } from "node:path";
import type { RunOptions } from "../core/types.js";
import { t } from "../i18n/index.js";
import { loadRepoContext } from "../context/repo-context.js";
import { runAudit } from "./run-audit.js";
import { renderTerminalReport } from "../report/terminal.js";
import { writeReports, type ExportChoice } from "../report/export.js";

/**
 * Caminho não-interativo (--json / --out): sem prompts. Autorrelato fica "não
 * respondido" e sai do cálculo (semântica de --ci). Escreve os relatórios e
 * imprime o score. Retorna o exit code.
 */
export async function runHeadless(options: RunOptions): Promise<number> {
  const ctx = await loadRepoContext(options);
  if (!ctx.git.isRepo) {
    process.stderr.write(t("detect.noGit", { path: ctx.root }) + "\n");
    return 2;
  }

  ctx.selfReport = { answered: false };
  const audit = await runAudit(ctx);

  // --out escreve md + json; --json sozinho escreve apenas json.
  const choices: ExportChoice[] = options.out ? ["md", "json"] : ["json"];
  const res = writeReports(ctx, audit, choices, new Date());

  process.stdout.write(renderTerminalReport(audit.score) + "\n\n");
  for (const file of res.writtenFiles) {
    process.stdout.write(t("export.wrote", { file: relative(ctx.root, file) || file }) + "\n");
  }
  return 0;
}
