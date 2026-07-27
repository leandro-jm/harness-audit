import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { PRECOMMIT_GLOBS } from "../patterns.js";
import { hasSecretScanInCi } from "../shared/security.js";

const META: CheckMeta = { id: "7.3", dimension: "D7", kind: "evidence" };

// Configs de scanner de segredos dedicado (mais preciso que o glob genérico de 4.2).
const DEDICATED_SCANNER_GLOBS = [
  ".gitleaks.toml",
  "gitleaks.toml",
  ".secretlintrc",
  ".secretlintrc.json",
  ".secretlintrc.yaml",
  ".secretlintrc.yml",
  ".trufflehog.yml",
  ".trufflehog.yaml",
  ".detect-secrets.yaml",
  ".secrets.baseline",
];
const PRECOMMIT_SECRET_RE = /gitleaks|detect-secrets|trufflehog|secretlint/i;

/**
 * 7.3 · Secret scanning dedicado (NIST SSDF PS.1). Eleva o 4.2: scanner dedicado
 * (gitleaks/trufflehog/detect-secrets/secretlint) em CI ou pre-commit.
 * 0 = nada · 1 = `.env` ignorado (higiene básica) · 2 = scanner dedicado.
 */
export const check73: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.7.3.title",
  run(ctx) {
    const configFile = ctx.files.find(DEDICATED_SCANNER_GLOBS)[0];
    const precommit = ctx.files.find(PRECOMMIT_GLOBS)[0];
    const precommitScans = precommit != null && PRECOMMIT_SECRET_RE.test(ctx.files.read(precommit) ?? "");

    if (configFile || precommitScans || hasSecretScanInCi(ctx)) {
      const file = configFile ?? precommit;
      return measured(META, {
        points: 2,
        evidences: [
          file
            ? evidence("check.7.3.dedicated", "evidence", { file, params: { file } })
            : evidence("check.7.3.dedicatedCi", "evidence"),
        ],
      });
    }

    const gitignore = ctx.files.read(".gitignore") ?? "";
    if (/(^|\n)\s*\*?\.env/i.test(gitignore)) {
      return measured(META, {
        points: 1,
        evidences: [evidence("check.7.3.basic", "evidence")],
        summaryKey: "check.7.3.weak",
      });
    }

    return measured(META, {
      points: 0,
      evidences: [evidence("check.7.3.none", "evidence")],
      summaryKey: "check.7.3.none",
    });
  },
};
