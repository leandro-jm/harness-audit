import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";

const META: CheckMeta = { id: "5.3", dimension: "D5", kind: "self-report" };

/**
 * 5.3 · Aprendizados voltam pro guia (autorrelato).
 * "Erro novo vira regra nova?" yes → 2 · sometimes → 1 · no → 0. Sem resposta → N/A.
 */
export const check53: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.5.3.title",
  run(ctx) {
    const answer = ctx.selfReport.learningsToGuide;
    if (!ctx.selfReport.answered || answer == null) {
      return notApplicable(META, "check.5.3.unanswered");
    }
    const points = answer === "yes" ? 2 : answer === "sometimes" ? 1 : 0;
    return measured(META, {
      points,
      evidences: [evidence(`check.5.3.${answer}`, "self-report")],
      summaryKey: points < 2 ? "check.5.3.weak" : undefined,
    });
  },
};
