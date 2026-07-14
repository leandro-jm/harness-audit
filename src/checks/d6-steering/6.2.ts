import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { hasInsufficientHistory } from "../../context/repo-context.js";
import { recentCommits, isFixCommit } from "../shared/history.js";
import { makeMatcher } from "../../util/glob.js";
import { HARNESS_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "6.2", dimension: "D6", kind: "proxy" };

const LOOKBACK = 5; // commits antes da edição do harness

/**
 * 6.2 · Time itera no harness (proxy).
 * Edições em guia/rules/CI correlacionadas a rajadas de fix (edição de harness
 * logo após fixes). Correlacionado → 2 · edita harness sem correlação → 1 · nunca → 0.
 */
export const check62: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.6.2.title",
  async run(ctx) {
    if (hasInsufficientHistory(ctx)) return notApplicable(META, "check.6.2.noHistory");

    const commits = (await recentCommits(ctx)).slice().reverse();
    const matchHarness = makeMatcher(HARNESS_GLOBS);

    const harnessIdx: number[] = [];
    commits.forEach((c, i) => {
      if (c.files.some(matchHarness)) harnessIdx.push(i);
    });

    if (harnessIdx.length === 0) {
      return measured(META, {
        points: 0,
        evidences: [evidence("check.6.2.none", "proxy")],
        summaryKey: "check.6.2.none",
      });
    }

    let correlated = false;
    for (const i of harnessIdx) {
      for (let j = Math.max(0, i - LOOKBACK); j < i; j++) {
        if (isFixCommit(commits[j]!)) {
          correlated = true;
          break;
        }
      }
      if (correlated) break;
    }

    const points = correlated ? 2 : 1;
    return measured(META, {
      points,
      evidences: [
        evidence(correlated ? "check.6.2.correlated" : "check.6.2.edits", "proxy", {
          params: { edits: harnessIdx.length },
        }),
      ],
      summaryKey: points < 2 ? "check.6.2.weak" : undefined,
    });
  },
};
