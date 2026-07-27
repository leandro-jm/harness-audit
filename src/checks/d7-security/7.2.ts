import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { DEP_UPDATE_GLOBS, MANIFEST_GLOBS } from "../patterns.js";
import { hasAuditInCi } from "../shared/security.js";

const META: CheckMeta = { id: "7.2", dimension: "D7", kind: "evidence" };

/**
 * 7.2 · Dependências monitoradas / SCA (NIST SSDF PW.4/RV.1). Update automatizado
 * (dependabot/renovate) e/ou varredura de deps no CI (audit/osv/trivy) — detecta
 * o step, não executa. 0 = nada · 1 = um · 2 = ambos. N/A se não há manifesto.
 */
export const check72: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.7.2.title",
  run(ctx) {
    if (!ctx.files.exists(MANIFEST_GLOBS)) {
      return notApplicable(META, "check.7.2.noManifest");
    }

    const updateFile = ctx.files.find(DEP_UPDATE_GLOBS)[0];
    const audit = hasAuditInCi(ctx);

    let points = 0;
    const evidences = [];
    if (updateFile) {
      points++;
      evidences.push(evidence("check.7.2.updates", "evidence", { file: updateFile, params: { file: updateFile } }));
    }
    if (audit) {
      points++;
      evidences.push(evidence("check.7.2.audit", "evidence"));
    }
    if (evidences.length === 0) evidences.push(evidence("check.7.2.none", "evidence"));

    return measured(META, {
      points,
      evidences,
      summaryKey: points < 2 ? "check.7.2.weak" : undefined,
    });
  },
};
