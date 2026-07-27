import type { RepoContext } from "../context/repo-context.js";
import type { CheckResult } from "../checks/types.js";
import type { Score } from "../scoring/types.js";
import { computeScore } from "../scoring/engine.js";
import { runChecks } from "./run-checks.js";

export interface AuditResult {
  results: CheckResult[];
  score: Score;
}

/**
 * Orquestrador headless: roda todos os checks do perfil e calcula o score.
 * Assume que `ctx.selfReport` já está preenchido (wizard, --ci ou teste).
 * Usado pelos testes e pelo caminho não-interativo (--json).
 */
export async function runAudit(ctx: RepoContext): Promise<AuditResult> {
  const results = await runChecks(ctx);
  return { results, score: computeScore(results, ctx.profile) };
}
