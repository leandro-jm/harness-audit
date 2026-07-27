import type { RepoContext } from "../../context/repo-context.js";

/**
 * Sinal unificado de "sensores bloqueiam o merge" (3.6/7.6). Prefere a evidência
 * do --github (branch protection); senão o autorrelato do 3.6. `blocks: null`
 * significa desconhecido (sai do denominador).
 */
export interface MergeGate {
  blocks: boolean | null;
  source: "evidence" | "self-report" | "none";
}

export function mergeGate(ctx: RepoContext): MergeGate {
  if (ctx.github != null) {
    return { blocks: ctx.github.blocksMerge, source: "evidence" };
  }
  if (ctx.selfReport.answered && ctx.selfReport.sensorsBlockMerge != null) {
    const a = ctx.selfReport.sensorsBlockMerge;
    if (a === "unknown") return { blocks: null, source: "self-report" };
    return { blocks: a === "block", source: "self-report" };
  }
  return { blocks: null, source: "none" };
}
