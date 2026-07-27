import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { hasSecuritySensorInCi } from "../shared/security.js";
import { mergeGate } from "../shared/merge-gate.js";

const META: CheckMeta = { id: "7.6", dimension: "D7", kind: "self-report" };

/**
 * 7.6 · Sensores de segurança bloqueiam e rodam em PR (NIST SSDF PO.3/PW.7).
 * Reaproveita o sinal de branch protection do 3.6 (autorrelato hoje; evidência
 * via --github na F5) — sem nova pergunta. N/A se não há CI nem sensor de
 * segurança para bloquear (a ausência já é penalizada em 7.1–7.3).
 */
export const check76: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.7.6.title",
  run(ctx) {
    if (ctx.ci.provider === "none") return notApplicable(META, "check.7.6.noCi");
    if (!hasSecuritySensorInCi(ctx)) return notApplicable(META, "check.7.6.noSensor");

    if (!ctx.ci.runsOnPullRequest) {
      return measured(META, {
        points: 0,
        evidences: [evidence("check.7.6.notOnPr", "evidence")],
        summaryKey: "check.7.6.notOnPr",
      });
    }

    const gate = mergeGate(ctx);
    if (gate.blocks == null) {
      // Roda em PR, mas o bloqueio não foi confirmado → fora do denominador.
      return notApplicable(META, "check.7.6.blockUnknown");
    }
    const isEvidence = gate.source === "evidence";
    const kind = isEvidence ? "evidence" : "self-report";
    if (gate.blocks) {
      return measured(META, {
        points: 2,
        seal: isEvidence ? "evidencia" : "autorrelato",
        evidences: [evidence("check.7.6.blockOnPr", kind)],
      });
    }
    return measured(META, {
      points: 1,
      seal: isEvidence ? "evidencia" : "autorrelato",
      evidences: [evidence("check.7.6.onPrOnly", kind)],
      summaryKey: "check.7.6.onPrOnly",
    });
  },
};
