import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { SECRET_SCANNER_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "4.2", dimension: "D4", kind: "evidence" };

// Padrões conservadores (evitar falso-positivo, que mina a confiança da ferramenta).
const SECRET_RES: Array<[string, RegExp]> = [
  ["aws", /AKIA[0-9A-Z]{16}/],
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ["openai", /\bsk-[A-Za-z0-9]{32,}\b/],
  ["github", /\bghp_[A-Za-z0-9]{36}\b/],
  ["slack", /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ["google", /\bAIza[0-9A-Za-z_-]{35}\b/],
];

const MAX_SCAN_FILES = 300;
// Pula arquivos onde "segredos" costumam ser placeholders (reduz falso-positivo).
const SKIP_SCAN_RE = /(^|\/)(test|tests|__tests__|fixtures?|mocks?)\//i;
const SKIP_NAME_RE = /(example|sample|template|\.md$|\.lock$|lock\.|\.min\.)/i;

/**
 * 4.2 · Higiene de segredos.
 * Scanner configurado (+1), `.env` no `.gitignore` (+1). Segredo óbvio commitado
 * derruba para 0 com evidência. Cap 2.
 */
export const check42: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.4.2.title",
  run(ctx) {
    const scanner = ctx.files.find(SECRET_SCANNER_GLOBS);
    const gitignore = ctx.files.read(".gitignore") ?? "";
    const envIgnored = /(^|\n)\s*\*?\.env/i.test(gitignore);

    const leak = scanForSecret(ctx);
    if (leak) {
      return measured(META, {
        points: 0,
        evidences: [
          evidence("check.4.2.leak", "evidence", { file: leak.file, params: { file: leak.file } }),
        ],
        summaryKey: "check.4.2.leak",
        summaryParams: { file: leak.file },
      });
    }

    let points = 0;
    const evidences = [];
    if (scanner.length > 0) {
      points++;
      evidences.push(
        evidence("check.4.2.scanner", "evidence", {
          file: scanner[0],
          params: { file: scanner[0]! },
        }),
      );
    }
    if (envIgnored) {
      points++;
      evidences.push(evidence("check.4.2.envIgnored", "evidence"));
    }
    if (evidences.length === 0) evidences.push(evidence("check.4.2.none", "evidence"));

    return measured(META, {
      points: Math.min(2, points),
      evidences,
      summaryKey: points < 2 ? "check.4.2.weak" : undefined,
    });
  },
};

function scanForSecret(ctx: {
  files: { all: string[]; read(p: string): string | null };
}): { file: string; kind: string } | null {
  let scanned = 0;
  for (const file of ctx.files.all) {
    if (scanned >= MAX_SCAN_FILES) break;
    if (SKIP_SCAN_RE.test(file) || SKIP_NAME_RE.test(file)) continue;
    const content = ctx.files.read(file);
    if (content == null) continue;
    scanned++;
    for (const [kind, re] of SECRET_RES) {
      if (re.test(content)) return { file, kind };
    }
  }
  return null;
}
