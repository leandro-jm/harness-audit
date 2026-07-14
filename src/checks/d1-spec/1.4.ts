import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { SPEC_GLOBS, SRC_GLOBS } from "../patterns.js";
import { makeMatcher } from "../../util/glob.js";
import { hasInsufficientHistory } from "../../context/repo-context.js";

const META: CheckMeta = { id: "1.4", dimension: "D1", kind: "evidence" };

const WINDOW = 20; // "últimos 20 commits/PRs" (PRD 1.4)

/**
 * 1.4 · Spec drift.
 * % dos últimos WINDOW commits que mudam src SEM tocar specs. Só faz sentido se
 * há specs (senão 1.1 já cobre a ausência). <20% → 2 · 20–50% → 1 · >50% → 0.
 */
export const check14: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.1.4.title",
  async run(ctx) {
    if (ctx.files.find(SPEC_GLOBS).length === 0) {
      return notApplicable(META, "check.1.4.noSpec");
    }
    if (hasInsufficientHistory(ctx)) {
      return notApplicable(META, "check.1.4.noHistory");
    }

    const commits = await ctx.git.log({ maxCount: WINDOW, noMerges: true, withFiles: true });
    const matchSrc = makeMatcher(SRC_GLOBS);
    const matchSpec = makeMatcher(SPEC_GLOBS);

    let srcCommits = 0;
    let drift = 0;
    for (const c of commits) {
      const touchesSrc = c.files.some(matchSrc);
      if (!touchesSrc) continue;
      srcCommits++;
      if (!c.files.some(matchSpec)) drift++;
    }

    if (srcCommits === 0) {
      return notApplicable(META, "check.1.4.noSrcCommits");
    }

    const pct = Math.round((drift / srcCommits) * 100);
    const ratio = drift / srcCommits;
    const points = ratio < 0.2 ? 2 : ratio <= 0.5 ? 1 : 0;

    return measured(META, {
      points,
      evidences: [evidence("check.1.4.drift", "evidence", { params: { drift, srcCommits, pct } })],
      summaryKey: points < 2 ? "check.1.4.summary" : undefined,
      summaryParams: { drift, srcCommits },
    });
  },
};
