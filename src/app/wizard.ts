import {
  intro,
  outro,
  note,
  confirm,
  select,
  multiselect,
  spinner,
  isCancel,
  cancel,
  log,
} from "@clack/prompts";
import { relative } from "node:path";
import { DIMENSIONS, type Profile, type RunOptions } from "../core/types.js";
import type { Language } from "../context/stack.js";
import { t } from "../i18n/index.js";
import { colors } from "../util/colors.js";
import { formatDuration } from "../util/format.js";
import { loadRepoContext, type RepoContext } from "../context/repo-context.js";
import { describeDetection } from "../context/summary.js";
import { forProfile } from "../checks/registry.js";
import type { CheckResult } from "../checks/types.js";
import { computeScore } from "../scoring/engine.js";
import { renderTerminalReport } from "../report/terminal.js";
import { relevantQuestions } from "../self-report/questions.js";
import type { AuditResult } from "./run-audit.js";
import {
  writeReports,
  missingGitignoreEntries,
  appendGitignore,
  REPORT_MD,
  REPORT_JSON,
  type ExportChoice,
} from "../report/export.js";

const PROFILE_OPTIONS = (["built-by-ai", "uses-ai", "both", "conventional"] as Profile[]).map(
  (value) => ({ value, label: t(`profile.${value}`) }),
);

const LANG_OPTIONS = (["ts", "js", "python", "go", "unknown"] as Language[]).map((value) => ({
  value,
  label: t(`lang.${value}`),
}));

/** Sinal de cancelamento limpo (Ctrl+C / ESC). Nada foi escrito ainda. */
class Cancelled extends Error {}

function guard<T>(value: T | symbol): T {
  if (isCancel(value)) throw new Cancelled();
  return value as T;
}

export interface WizardOutcome {
  ctx: RepoContext;
  audit: AuditResult;
}

/**
 * Fluxo interativo completo (PRD §6). Retorna o contexto + resultado para que o
 * chamador (M7) ofereça exportação. Lança Cancelled em Ctrl+C — o CLI trata como
 * saída limpa (exit 0) sem escrever nada.
 */
export async function runWizard(options: RunOptions): Promise<WizardOutcome | "no-git" | "cancelled"> {
  intro(`${colors.bgCyan(colors.black(" harness-audit "))} ${colors.dim(t("app.tagline"))}`);
  note(t("app.privacy"), t("wizard.privacyTitle"));

  const ctx = await loadRepoContext(options);
  if (!ctx.git.isRepo) return "no-git";

  try {
    note(describeDetection(ctx).join("\n"), t("wizard.detectionTitle"));

    // 1. Confirmar / ajustar stack.
    const stackOk = guard(await confirm({ message: t("wizard.confirmStack") }));
    if (!stackOk) {
      const lang = guard(
        await select({
          message: t("wizard.adjustLang"),
          options: LANG_OPTIONS,
          initialValue: ctx.stack.primary,
        }),
      );
      ctx.stack.primary = lang;
      ctx.stack.supported = lang === "ts" || lang === "js";
    }

    // 2. Perfil (pulado se veio por --profile).
    if (options.profile) {
      ctx.profile = options.profile;
    } else {
      ctx.profile = guard(
        await select({ message: t("wizard.profile"), options: PROFILE_OPTIONS }),
      );
    }

    // 3. Checks de evidência/proxy, com progresso por dimensão.
    const allChecks = forProfile(ctx.profile);
    const evidenceChecks = allChecks.filter((c) => c.kind !== "self-report");
    const selfReportChecks = allChecks.filter((c) => c.kind === "self-report");

    const results: CheckResult[] = [];
    log.step(t("wizard.running", { n: evidenceChecks.length }));
    for (const dim of DIMENSIONS) {
      const dimChecks = evidenceChecks.filter((c) => c.dimension === dim);
      if (dimChecks.length === 0) continue;
      const s = spinner();
      s.start(`${dim} ${t(`dim.${dim}`)}`);
      const started = performance.now();
      for (const check of dimChecks) results.push(await check.run(ctx));
      const ms = performance.now() - started;
      s.stop(
        `${dim} ${t(`dim.${dim}`)} · ${t("wizard.checksCount", { n: dimChecks.length })} · ${formatDuration(ms)}`,
      );
    }

    // 4. Autorrelato (≤6 perguntas relevantes, rotuladas [autorrelato]).
    ctx.selfReport = { answered: true };
    for (const q of relevantQuestions(ctx)) {
      const answer = guard(
        await select({
          message: `${colors.yellow(`[${t("seal.autorrelato")}]`)} ${t(q.messageKey)}`,
          options: q.options.map((o) => ({ value: o.value, label: t(o.labelKey) })),
        }),
      );
      q.apply(ctx.selfReport, answer);
    }
    for (const check of selfReportChecks) results.push(await check.run(ctx));

    // 5. Score + render.
    const score = computeScore(results);
    const audit: AuditResult = { results, score };
    process.stdout.write("\n" + renderTerminalReport(score) + "\n\n");

    // 6. Exportação consentida (nada é escrito sem escolha explícita).
    await exportStep(ctx, audit);

    return { ctx, audit };
  } catch (err) {
    if (err instanceof Cancelled) {
      cancel(t("wizard.cancelled"));
      return "cancelled";
    }
    throw err;
  }
}

/** Passo de exportação: multiselect → escreve arquivos escolhidos → oferece .gitignore. */
async function exportStep(ctx: RepoContext, audit: AuditResult): Promise<void> {
  const choice = guard(
    await multiselect({
      message: t("export.prompt"),
      required: false,
      options: [
        { value: "md" as ExportChoice, label: REPORT_MD, hint: t("export.hint.md") },
        { value: "json" as ExportChoice, label: REPORT_JSON, hint: t("export.hint.json") },
        { value: "snippet" as ExportChoice, label: t("export.snippet"), hint: t("export.hint.snippet") },
      ],
    }),
  );
  const choices = choice as ExportChoice[];
  if (choices.length === 0) return;

  const res = writeReports(ctx, audit, choices, new Date());
  for (const file of res.writtenFiles) {
    log.success(t("export.wrote", { file: relative(ctx.root, file) || file }));
  }
  if (res.snippet) note(res.snippet, t("export.snippetTitle"));

  // Oferece adicionar ao .gitignore quando escrevemos dentro do próprio repo.
  if (res.writtenFiles.length > 0 && res.outDir === ctx.root) {
    const missing = missingGitignoreEntries(
      ctx.root,
      res.writtenFiles.map((f) => (f.endsWith(".json") ? REPORT_JSON : REPORT_MD)),
    );
    if (missing.length > 0) {
      const add = guard(
        await confirm({ message: t("export.gitignore", { files: missing.join(", ") }) }),
      );
      if (add) {
        appendGitignore(ctx.root, missing);
        log.success(t("export.gitignoreDone"));
      }
    }
  }
}

/** Encerra o wizard com a linha de conclusão. */
export function finishWizard(): void {
  outro(t("wizard.done"));
}
