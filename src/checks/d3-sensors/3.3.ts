import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";

const META: CheckMeta = { id: "3.3", dimension: "D3", kind: "evidence" };

/**
 * 3.3 · Sensor de tipos (typecheck) no CI.
 * Aplicável a stacks tipadas (ts/python via mypy/pyright). Para js/go puros → N/A.
 */
export const check33: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.3.3.title",
  run(ctx) {
    if (ctx.ci.provider === "none") return notApplicable(META, "check.sensor.noCi");
    if (!ctx.ci.fullyParsed)
      return notApplicable(META, "check.sensor.notParsed", { provider: ctx.ci.provider });

    const applicable = ctx.stack.primary === "ts" || ctx.stack.primary === "python";
    if (!applicable) return notApplicable(META, "check.3.3.notTyped");

    return measured(META, {
      points: ctx.ci.hasTypecheck ? 2 : 0,
      evidences: [
        evidence(ctx.ci.hasTypecheck ? "check.3.3.found" : "check.3.3.none", "evidence"),
      ],
      summaryKey: ctx.ci.hasTypecheck ? undefined : "check.3.3.none",
    });
  },
};
