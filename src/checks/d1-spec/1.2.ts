import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { SPEC_GLOBS } from "../patterns.js";
import { hasInsufficientHistory } from "../../context/repo-context.js";

const META: CheckMeta = { id: "1.2", dimension: "D1", kind: "evidence" };

/**
 * 1.2 · Spec é versionada de verdade.
 * Olha o histórico git dos arquivos de spec: nº de commits e autores distintos.
 * 0 → não rastreada · 1 → poucos commits / 1 autor · 2 → ≥3 commits e ≥2 autores.
 */
export const check12: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.1.2.title",
  async run(ctx) {
    const specs = ctx.files.find(SPEC_GLOBS);
    if (specs.length === 0) {
      return notApplicable(META, "check.1.2.noSpec");
    }
    if (hasInsufficientHistory(ctx)) {
      return notApplicable(META, "check.1.2.noHistory");
    }

    const history = await ctx.git.fileHistory(specs);
    const commits = history.length;
    const authors = new Set(history.map((c) => c.authorEmail.toLowerCase())).size;

    let points = 0;
    if (commits >= 3 && authors >= 2) points = 2;
    else if (commits >= 1) points = 1;

    return measured(META, {
      points,
      evidences: [
        evidence("check.1.2.stats", "evidence", { params: { commits, authors } }),
      ],
      summaryKey: points < 2 ? "check.1.2.weak" : undefined,
      summaryParams: { commits, authors },
    });
  },
};
