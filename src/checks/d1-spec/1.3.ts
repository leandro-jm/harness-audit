import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { SPEC_GLOBS, SRC_GLOBS } from "../patterns.js";
import { makeMatcher } from "../../util/glob.js";
import { hasInsufficientHistory } from "../../context/repo-context.js";

const META: CheckMeta = { id: "1.3", dimension: "D1", kind: "proxy" };

const SAMPLE = 80; // janela de commits analisada
const WINDOW = 5; // quantos commits antes contam como "spec precedeu"

/**
 * 1.3 · Spec vem antes do código (proxy).
 * Para cada commit que toca src, verifica se um commit tocando specs ocorreu no
 * mesmo commit ou nos WINDOW commits anteriores. ratio = cobertos / commits-src.
 * ≥0,6 → 2 · ≥0,3 → 1 · senão 0.
 */
export const check13: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.1.3.title",
  async run(ctx) {
    if (ctx.files.find(SPEC_GLOBS).length === 0) {
      return notApplicable(META, "check.1.3.noSpec");
    }
    if (hasInsufficientHistory(ctx)) {
      return notApplicable(META, "check.1.3.noHistory");
    }

    // Ordena do mais antigo para o mais novo (índices crescem no tempo).
    const commits = (await ctx.git.log({ maxCount: SAMPLE, noMerges: true, withFiles: true }))
      .slice()
      .reverse();
    const matchSrc = makeMatcher(SRC_GLOBS);
    const matchSpec = makeMatcher(SPEC_GLOBS);

    const touchesSrc = commits.map((c) => c.files.some(matchSrc));
    const touchesSpec = commits.map((c) => c.files.some(matchSpec));

    let srcCommits = 0;
    let covered = 0;
    for (let i = 0; i < commits.length; i++) {
      if (!touchesSrc[i]) continue;
      srcCommits++;
      for (let j = Math.max(0, i - WINDOW); j <= i; j++) {
        if (touchesSpec[j]) {
          covered++;
          break;
        }
      }
    }

    if (srcCommits === 0) {
      return notApplicable(META, "check.1.3.noSrcCommits");
    }

    const ratio = covered / srcCommits;
    const pct = Math.round(ratio * 100);
    const points = ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0;

    return measured(META, {
      points,
      evidences: [evidence("check.1.3.ratio", "proxy", { params: { covered, srcCommits, pct } })],
      summaryKey: points < 2 ? "check.1.3.weak" : undefined,
      summaryParams: { pct },
    });
  },
};
