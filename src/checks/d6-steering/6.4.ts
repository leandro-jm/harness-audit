import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";

const META: CheckMeta = { id: "6.4", dimension: "D6", kind: "self-report" };

/**
 * 6.4 · Harness tem dono (autorrelato).
 * Responsável + backlog. yes-backlog → 2 · informal → 1 · ninguém → 0. Sem resposta → N/A.
 */
export const check64: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.6.4.title",
  run(ctx) {
    const answer = ctx.selfReport.harnessOwner;
    if (!ctx.selfReport.answered || answer == null) {
      return notApplicable(META, "check.6.4.unanswered");
    }
    const points = answer === "yes-backlog" ? 2 : answer === "informal" ? 1 : 0;
    return measured(META, {
      points,
      evidences: [evidence(`check.6.4.${answer}`, "self-report")],
      summaryKey: points < 2 ? "check.6.4.weak" : undefined,
    });
  },
};
