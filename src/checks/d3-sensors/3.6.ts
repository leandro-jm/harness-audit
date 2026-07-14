import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";

const META: CheckMeta = { id: "3.6", dimension: "D3", kind: "self-report" };

/**
 * 3.6 · Sensores bloqueiam merge (branch protection).
 * v0.1 sem --github → autorrelato. block → 2 · inform → 1 · unknown/sem CI → N/A.
 * (v0.2: --github lê branch protection e isto vira evidência.)
 */
export const check36: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.3.6.title",
  run(ctx) {
    if (ctx.ci.provider === "none") return notApplicable(META, "check.3.6.noCi");

    const answer = ctx.selfReport.sensorsBlockMerge;
    if (!ctx.selfReport.answered || answer == null || answer === "unknown") {
      return notApplicable(META, "check.3.6.unknown");
    }
    const points = answer === "block" ? 2 : 1;
    return measured(META, {
      points,
      evidences: [evidence(`check.3.6.${answer}`, "self-report")],
      summaryKey: points < 2 ? "check.3.6.inform" : undefined,
    });
  },
};
