import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { guideFiles, guideText } from "../shared/guide.js";

const META: CheckMeta = { id: "2.2", dimension: "D2", kind: "evidence" };

// Placeholders típicos de template não editado (penalizam).
const PLACEHOLDER_RE =
  /<your-[^>]+>|<[A-Z_]{3,}>|\bTODO\b|\bFIXME\b|replace this|preencha aqui|your-project-name|example\.com/i;

/**
 * 2.2 · Guia é específico, não template (mitigação de falso-positivo, PRD §12).
 * Cruza o texto do guia com scripts e diretórios REAIS do repo. Conta referências
 * distintas; penaliza placeholders. 0 refs → 0 · 1–2 → 1 · ≥3 c/ ≥1 script real → 2.
 */
export const check22: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.2.2.title",
  run(ctx) {
    const guides = guideFiles(ctx);
    if (guides.length === 0) {
      return notApplicable(META, "check.2.2.noGuide");
    }

    const text = guideText(ctx);
    const lower = text.toLowerCase();

    const realScripts = Object.keys(ctx.pkg?.scripts ?? {});
    const scriptRefs = realScripts.filter(
      (s) => new RegExp(`\\b(run\\s+)?${escapeRe(s)}\\b`).test(lower),
    );

    const realDirs = ctx.files.topLevelDirs;
    const dirRefs = realDirs.filter((d) => new RegExp(`\\b${escapeRe(d)}/`).test(text));

    // Blocos de comando executável (npm/pnpm/yarn + algo).
    const hasCommandBlock = /(npm|pnpm|yarn|npx)\s+[\w:-]+/.test(text);

    const distinctRefs = new Set<string>([
      ...scriptRefs.map((s) => `s:${s}`),
      ...dirRefs.map((d) => `d:${d}`),
      ...(hasCommandBlock ? ["cmd"] : []),
    ]);
    const refCount = distinctRefs.size;
    const hasPlaceholder = PLACEHOLDER_RE.test(text);

    let points: number;
    if (refCount === 0 || (hasPlaceholder && refCount < 2)) points = 0;
    else if (refCount >= 3 && scriptRefs.length >= 1) points = 2;
    else points = 1;

    return measured(META, {
      points,
      evidences: [
        evidence("check.2.2.refs", "evidence", {
          params: { refs: refCount, scripts: scriptRefs.length, dirs: dirRefs.length },
        }),
        ...(hasPlaceholder ? [evidence("check.2.2.placeholder", "evidence")] : []),
      ],
      summaryKey: points < 2 ? "check.2.2.weak" : undefined,
    });
  },
};

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
