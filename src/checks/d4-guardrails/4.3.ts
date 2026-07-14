import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { CODEOWNERS_GLOBS, PR_TEMPLATE_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "4.3", dimension: "D4", kind: "evidence" };

/** 4.3 · Revisão estruturada. CODEOWNERS (+1) e template de PR (+1). */
export const check43: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.4.3.title",
  run(ctx) {
    const codeowners = ctx.files.find(CODEOWNERS_GLOBS);
    const prTemplate = ctx.files.find(PR_TEMPLATE_GLOBS);

    let points = 0;
    const evidences = [];
    if (codeowners.length > 0) {
      points++;
      evidences.push(
        evidence("check.4.3.codeowners", "evidence", {
          file: codeowners[0],
          params: { file: codeowners[0]! },
        }),
      );
    }
    if (prTemplate.length > 0) {
      points++;
      evidences.push(
        evidence("check.4.3.prTemplate", "evidence", {
          file: prTemplate[0],
          params: { file: prTemplate[0]! },
        }),
      );
    }
    if (evidences.length === 0) evidences.push(evidence("check.4.3.none", "evidence"));

    return measured(META, {
      points,
      evidences,
      summaryKey: points < 2 ? "check.4.3.weak" : undefined,
    });
  },
};
