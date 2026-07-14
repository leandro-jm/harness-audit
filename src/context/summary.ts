import { t } from "../i18n/index.js";
import type { RepoContext } from "./repo-context.js";
import type { StackInfo } from "./stack.js";

/** Descreve o repositório e a stack em linhas prontas para exibição. */
export function describeDetection(ctx: RepoContext): string[] {
  const lines: string[] = [];

  lines.push(
    t("detect.repo", {
      name: ctx.git.repoName,
      commits: ctx.git.commitCount,
      branch: ctx.git.branch || "?",
    }),
  );

  lines.push(
    t("detect.stack", {
      stack: stackLabel(ctx.stack),
      pm: ctx.stack.packageManager === "unknown" ? t("detect.pm.unknown") : ctx.stack.packageManager,
      ci: t(`detect.ci.${ctx.ci.provider}`),
    }),
  );

  for (const note of ctx.notes) {
    lines.push("⚠ " + t(note.messageKey, note.params));
  }

  return lines;
}

export function stackLabel(stack: StackInfo): string {
  return t(`lang.${stack.primary}`);
}
