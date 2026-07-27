import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";

const META: CheckMeta = { id: "7.7", dimension: "D7", kind: "self-report" };

/**
 * 7.7 · Vulnerabilidade vira regra/sensor (NIST SSDF RV / cultura). Espelha
 * 5.3/6.3: ao aparecer uma vuln, o time adiciona uma regra/sensor que pega a
 * classe inteira, ou só corrige o caso? yes = 2 · sometimes = 1 · no = 0.
 * Fora do denominador se não respondido (ex.: --ci).
 */
export const check77: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.7.7.title",
  run(ctx) {
    const answer = ctx.selfReport.answered ? ctx.selfReport.vulnToRule : undefined;
    if (answer == null) return notApplicable(META, "check.7.7.unanswered");

    const points = answer === "yes" ? 2 : answer === "sometimes" ? 1 : 0;
    return measured(META, {
      points,
      evidences: [evidence(`check.7.7.${answer}`, "self-report")],
      summaryKey: points < 2 ? "check.7.7.weak" : undefined,
    });
  },
};
