import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import type { RepoContext } from "../../context/repo-context.js";
import { evidence, measured, notPrepared, type CheckMeta } from "../result.js";
import { AGENT_PERMS_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "4.4", dimension: "D4", kind: "evidence" };

/**
 * 4.4 · Permissões de agente escopadas.
 * Config de permissão (.claude/settings*.json allow/deny, .mcp.json). Allowlist
 * específica → 2 · só presença/wildcard → 1 · nada → 0 (ou not-prepared p/ convencional).
 */
export const check44: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.4.4.title",
  run(ctx) {
    const configs = ctx.files.find(AGENT_PERMS_GLOBS);
    if (configs.length === 0) {
      if (ctx.profile === "conventional") return notPrepared(META, "check.4.4.notPrepared");
      return measured(META, {
        points: 0,
        evidences: [evidence("check.4.4.none", "evidence")],
        summaryKey: "check.4.4.none",
      });
    }

    const scoped = hasScopedAllowlist(ctx);
    const points = scoped ? 2 : 1;
    return measured(META, {
      points,
      evidences: configs
        .slice(0, 3)
        .map((f) => evidence("check.4.4.found", "evidence", { file: f, params: { file: f } })),
      summaryKey: points < 2 ? "check.4.4.broad" : undefined,
    });
  },
};

function hasScopedAllowlist(ctx: RepoContext): boolean {
  for (const file of [".claude/settings.json", ".claude/settings.local.json"]) {
    const raw = ctx.files.read(file);
    if (raw == null) continue;
    try {
      const parsed = JSON.parse(raw) as { permissions?: { allow?: unknown; deny?: unknown } };
      const allow = parsed.permissions?.allow;
      const deny = parsed.permissions?.deny;
      const allowList = Array.isArray(allow) ? (allow as string[]) : [];
      const denyList = Array.isArray(deny) ? (deny as string[]) : [];
      const specificAllow = allowList.some((a) => a !== "*" && !/^Bash\(\*\)?$/.test(a));
      if (specificAllow || denyList.length > 0) return true;
    } catch {
      // JSON inválido → trata como presente mas não claramente escopado.
    }
  }
  return false;
}
