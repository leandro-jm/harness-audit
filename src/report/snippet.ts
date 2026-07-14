import { t } from "../i18n/index.js";
import type { Score } from "../scoring/types.js";
import { formatScore, formatPercent } from "../util/format.js";

/** Texto curto de compartilhamento (pronto para post). */
export function buildSnippet(score: Score): string {
  return (
    `Harness Score: ${formatScore(score.global)}/4 · ${t(`level.${score.level}`).toUpperCase()} ` +
    `(${formatPercent(score.confidence)} evidência). ` +
    `Auditado com harness-audit — SDD & Harness Engineering. npx harness-audit`
  );
}
