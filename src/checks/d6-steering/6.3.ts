import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";

const META: CheckMeta = { id: "6.3", dimension: "D6", kind: "self-report" };

/**
 * 6.3 · Pergunta-assinatura (autorrelato).
 * "Quando o agente entrega errado, o que o time conserta primeiro?"
 * guia-ou-sensor → 2 (steering loop fechado) · prompt → 1 · código na mão → 0.
 */
export const check63: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.6.3.title",
  run(ctx) {
    const answer = ctx.selfReport.fixFirst;
    if (!ctx.selfReport.answered || answer == null) {
      return notApplicable(META, "check.6.3.unanswered");
    }
    const points = answer === "guide-or-sensor" ? 2 : answer === "prompt" ? 1 : 0;
    return measured(META, {
      points,
      evidences: [evidence(`check.6.3.${answer}`, "self-report")],
      summaryKey: points < 2 ? "check.6.3.weak" : undefined,
    });
  },
};
