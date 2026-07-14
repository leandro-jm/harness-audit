import type { RepoContext } from "../context/repo-context.js";
import type { Check, CheckResult } from "../checks/types.js";
import { forProfile } from "../checks/registry.js";

/** Resultado de um check com o tempo que levou (para o progresso por dimensão). */
export interface TimedResult {
  result: CheckResult;
  ms: number;
}

/** Roda os checks aplicáveis ao perfil do contexto, em ordem do registry. */
export async function runChecks(
  ctx: RepoContext,
  checks: Check[] = forProfile(ctx.profile),
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const check of checks) {
    results.push(await check.run(ctx));
  }
  return results;
}
