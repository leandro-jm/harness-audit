import type { RepoContext } from "../../context/repo-context.js";
import { GUIDE_GLOBS, SRC_GLOBS } from "../patterns.js";

export type FreshnessState = "none" | "untracked" | "fresh" | "attention" | "stale";

export interface Freshness {
  state: FreshnessState;
  /** Commits no código desde a última edição do guia. */
  commitsSince: number;
}

export function guideFiles(ctx: RepoContext): string[] {
  return ctx.files.find(GUIDE_GLOBS);
}

/** Texto concatenado de todos os guias (para o check de especificidade 2.2). */
export function guideText(ctx: RepoContext): string {
  return guideFiles(ctx)
    .map((f) => ctx.files.read(f) ?? "")
    .join("\n");
}

/**
 * Frescor do guia (2.3, 5.1): quantos commits de código houve desde a última
 * edição do guia. 0–10 fresco · 11–40 atenção · >40 estale.
 */
export async function guideFreshness(ctx: RepoContext): Promise<Freshness> {
  const guides = guideFiles(ctx);
  if (guides.length === 0) return { state: "none", commitsSince: 0 };

  const last = await ctx.git.lastCommitTouching(guides);
  if (!last) return { state: "untracked", commitsSince: 0 };

  const srcPaths = ctx.files.exists(SRC_GLOBS) ? SRC_GLOBS : undefined;
  const since = await ctx.git.countCommitsSince(last.sha, srcPaths);
  const state: FreshnessState = since <= 10 ? "fresh" : since <= 40 ? "attention" : "stale";
  return { state, commitsSince: since };
}
