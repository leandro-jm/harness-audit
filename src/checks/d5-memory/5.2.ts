import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { ADR_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "5.2", dimension: "D5", kind: "evidence" };

/**
 * 5.2 · Memória semântica de decisões (CoALA).
 * ADRs / registros de decisão de arquitetura. ≥2 → 2 · 1 → 1 · nenhum → 0.
 */
export const check52: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.5.2.title",
  run(ctx) {
    const adrs = ctx.files.find(ADR_GLOBS);
    const points = adrs.length >= 2 ? 2 : adrs.length === 1 ? 1 : 0;
    return measured(META, {
      points,
      evidences:
        adrs.length > 0
          ? adrs
              .slice(0, 3)
              .map((f) => evidence("check.5.2.found", "evidence", { file: f, params: { file: f } }))
          : [evidence("check.5.2.none", "evidence")],
      summaryKey: points < 2 ? "check.5.2.weak" : undefined,
    });
  },
};
