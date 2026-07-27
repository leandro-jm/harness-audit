import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { mergeGate } from "../shared/merge-gate.js";

const META: CheckMeta = { id: "3.6", dimension: "D3", kind: "self-report" };

/**
 * 3.6 · Sensores bloqueiam merge (branch protection).
 * Com --github, a branch protection vira EVIDÊNCIA; senão, autorrelato.
 * bloqueia → 2 · só informa → 1 · desconhecido/sem CI → N/A.
 */
export const check36: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.3.6.title",
  run(ctx) {
    if (ctx.ci.provider === "none") return notApplicable(META, "check.3.6.noCi");

    const gate = mergeGate(ctx);
    if (gate.blocks == null) return notApplicable(META, "check.3.6.unknown");

    const isEvidence = gate.source === "evidence";
    const points = gate.blocks ? 2 : 1;
    const detailKey = gate.blocks
      ? isEvidence
        ? "check.3.6.blockEvidence"
        : "check.3.6.block"
      : isEvidence
        ? "check.3.6.informEvidence"
        : "check.3.6.inform";
    return measured(META, {
      points,
      seal: isEvidence ? "evidencia" : "autorrelato",
      evidences: [evidence(detailKey, isEvidence ? "evidence" : "self-report")],
      summaryKey: points < 2 ? "check.3.6.inform" : undefined,
    });
  },
};
