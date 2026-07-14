import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { SPEC_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "1.1", dimension: "D1", kind: "evidence" };

const STRUCTURED_GLOBS = [
  "specs/**",
  "spec/**",
  "docs/specs/**",
  ".speckit/**",
  ".kiro/**",
  "openspec/**",
];

/**
 * 1.1 · Spec mora no repo.
 * 0 → nenhuma spec · 1 → spec avulsa (spec.md, *.spec.md) ·
 * 2 → diretório estruturado com ≥2 artefatos (specs/, .speckit/, .kiro/…).
 */
export const check11: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.1.1.title",
  run(ctx) {
    const matches = ctx.files.find(SPEC_GLOBS);
    if (matches.length === 0) {
      return measured(META, {
        points: 0,
        evidences: [evidence("check.1.1.none", "evidence")],
        summaryKey: "check.1.1.none",
      });
    }
    const structured = ctx.files.find(STRUCTURED_GLOBS).length >= 2;
    return measured(META, {
      points: structured ? 2 : 1,
      evidences: matches
        .slice(0, 5)
        .map((f) => evidence("check.1.1.found", "evidence", { file: f, params: { file: f } })),
      summaryKey: structured ? undefined : "check.1.1.loose",
    });
  },
};
