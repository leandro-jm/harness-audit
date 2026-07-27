import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { EVAL_GLOBS } from "../patterns.js";
import { hasDep, EVAL_DEPS } from "../shared/runtime.js";

const META: CheckMeta = { id: "8.1", dimension: "D8", kind: "evidence" };

/**
 * 8.1 · Evals de LLM configuradas (trilha de runtime harness, Böckeler). Detecta
 * config/dir de avaliação (promptfoo/deepeval/ragas) ou a dependência.
 * 0 = nada · 1 = só a dependência · 2 = suíte de eval configurada.
 */
export const check81: Check = {
  ...META,
  profiles: ["uses-ai", "both"],
  weight: 1,
  titleKey: "check.8.1.title",
  run(ctx) {
    const config = ctx.files.find(EVAL_GLOBS)[0];
    if (config) {
      return measured(META, {
        points: 2,
        evidences: [evidence("check.8.1.suite", "evidence", { file: config, params: { file: config } })],
      });
    }
    if (hasDep(ctx, EVAL_DEPS)) {
      return measured(META, {
        points: 1,
        evidences: [evidence("check.8.1.depOnly", "evidence")],
        summaryKey: "check.8.1.weak",
      });
    }
    return measured(META, {
      points: 0,
      evidences: [evidence("check.8.1.none", "evidence")],
      summaryKey: "check.8.1.none",
    });
  },
};
