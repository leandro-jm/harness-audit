import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { GUARDRAIL_GLOBS } from "../patterns.js";
import { hasDep, GUARDRAIL_DEPS } from "../shared/runtime.js";

const META: CheckMeta = { id: "8.4", dimension: "D8", kind: "evidence" };

/**
 * 8.4 · Guardrails de tool use / saída (trilha de runtime harness). Validação de
 * saída, allowlists de ferramentas, anti-injeção (guardrails-ai/NeMo/llm-guard).
 * O "guardrail" do harness de runtime. 0 = nada · 2 = configurado.
 */
export const check84: Check = {
  ...META,
  profiles: ["uses-ai", "both"],
  weight: 1,
  titleKey: "check.8.4.title",
  run(ctx) {
    const config = ctx.files.find(GUARDRAIL_GLOBS)[0];
    if (config || hasDep(ctx, GUARDRAIL_DEPS)) {
      return measured(META, {
        points: 2,
        evidences: [
          config
            ? evidence("check.8.4.found", "evidence", { file: config, params: { file: config } })
            : evidence("check.8.4.dep", "evidence"),
        ],
      });
    }
    return measured(META, {
      points: 0,
      evidences: [evidence("check.8.4.none", "evidence")],
      summaryKey: "check.8.4.none",
    });
  },
};
