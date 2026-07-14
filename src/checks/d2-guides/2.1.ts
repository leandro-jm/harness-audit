import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notPrepared, type CheckMeta } from "../result.js";
import { GUIDE_GLOBS, PRIMARY_GUIDE_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "2.1", dimension: "D2", kind: "evidence" };

/**
 * 2.1 · Guia de agente existe (feedforward).
 * 0 → nenhum guia · 1 → só regras auxiliares (cursor/rules etc.) ·
 * 2 → guia principal de topo (CLAUDE.md/AGENTS.md/GEMINI.md/copilot).
 */
export const check21: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.2.1.title",
  run(ctx) {
    const found = ctx.files.find(GUIDE_GLOBS);
    const primary = ctx.files.find(PRIMARY_GUIDE_GLOBS);

    if (found.length === 0) {
      // Convencional sem guia é esperado (pre-flight), não uma falha punitiva.
      if (ctx.profile === "conventional") {
        return notPrepared(META, "check.2.1.notPrepared");
      }
      return measured(META, {
        points: 0,
        evidences: [evidence("check.2.1.none", "evidence")],
        summaryKey: "check.2.1.none",
      });
    }

    const points = primary.length > 0 ? 2 : 1;
    return measured(META, {
      points,
      evidences: found
        .slice(0, 5)
        .map((f) => evidence("check.2.1.found", "evidence", { file: f, params: { file: f } })),
      summaryKey: points < 2 ? "check.2.1.partial" : undefined,
    });
  },
};
