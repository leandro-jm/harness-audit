import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { SAST_WORKFLOW_GLOBS, SAST_CONFIG_GLOBS } from "../patterns.js";
import { hasSastInCi } from "../shared/security.js";

const META: CheckMeta = { id: "7.1", dimension: "D7", kind: "evidence" };

// Lints de segurança (heurístico): elevam a nota para 1, não para 2.
const SECURITY_LINT_DEPS = [
  "eslint-plugin-security",
  "eslint-plugin-no-unsanitized",
  "bandit",
  "flake8-bandit",
];

/**
 * 7.1 · SAST configurado (OWASP DSOMM · NIST SSDF PW.7/PW.8). Detecta o sensor,
 * não o roda. 0 = nenhum · 1 = só lint de segurança · 2 = SAST dedicado.
 */
export const check71: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.7.1.title",
  run(ctx) {
    const workflow = ctx.files.find(SAST_WORKFLOW_GLOBS)[0];
    const config = ctx.files.find(SAST_CONFIG_GLOBS)[0];
    if (workflow || config || hasSastInCi(ctx)) {
      const file = workflow ?? config;
      return measured(META, {
        points: 2,
        evidences: [
          file
            ? evidence("check.7.1.dedicated", "evidence", { file, params: { file } })
            : evidence("check.7.1.dedicatedCi", "evidence"),
        ],
      });
    }

    const lint = (ctx.pkg?.allDepNames ?? []).find((d) => SECURITY_LINT_DEPS.includes(d));
    if (lint) {
      return measured(META, {
        points: 1,
        evidences: [evidence("check.7.1.lintOnly", "evidence", { params: { dep: lint } })],
        summaryKey: "check.7.1.weak",
      });
    }

    return measured(META, {
      points: 0,
      evidences: [evidence("check.7.1.none", "evidence")],
      summaryKey: "check.7.1.none",
    });
  },
};
