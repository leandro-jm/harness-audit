import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { hasDep, OBSERVABILITY_DEPS } from "../shared/runtime.js";

const META: CheckMeta = { id: "8.3", dimension: "D8", kind: "evidence" };

/**
 * 8.3 · Observabilidade / rastreio de custo de LLM (trilha de runtime harness).
 * O "sensor" do harness de runtime: traços, latência e custo por turno
 * (LangSmith/Langfuse/Helicone/OpenLLMetry). 0 = nada · 2 = instrumentado.
 */
export const check83: Check = {
  ...META,
  profiles: ["uses-ai", "both"],
  weight: 1,
  titleKey: "check.8.3.title",
  run(ctx) {
    if (hasDep(ctx, OBSERVABILITY_DEPS)) {
      return measured(META, { points: 2, evidences: [evidence("check.8.3.found", "evidence")] });
    }
    return measured(META, {
      points: 0,
      evidences: [evidence("check.8.3.none", "evidence")],
      summaryKey: "check.8.3.none",
    });
  },
};
