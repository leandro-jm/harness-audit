import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { SECURITY_POLICY_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "7.5", dimension: "D7", kind: "evidence" };

/**
 * 7.5 · Política de resposta a vulnerabilidade (NIST SSDF RV.3). Canal de
 * divulgação declarado: SECURITY.md (raiz/.github/docs) com contato/processo.
 * 0 = ausente · 2 = presente.
 */
export const check75: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.7.5.title",
  run(ctx) {
    const policy = ctx.files.find(SECURITY_POLICY_GLOBS)[0];
    if (policy) {
      return measured(META, {
        points: 2,
        evidences: [evidence("check.7.5.found", "evidence", { file: policy, params: { file: policy } })],
      });
    }
    return measured(META, {
      points: 0,
      evidences: [evidence("check.7.5.none", "evidence")],
      summaryKey: "check.7.5.none",
    });
  },
};
