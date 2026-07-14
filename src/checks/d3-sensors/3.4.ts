import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";

const META: CheckMeta = { id: "3.4", dimension: "D3", kind: "evidence" };

/** 3.4 · Sensor de comportamento (testes) no CI. */
export const check34: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.3.4.title",
  run(ctx) {
    if (ctx.ci.provider === "none") return notApplicable(META, "check.sensor.noCi");
    if (!ctx.ci.fullyParsed)
      return notApplicable(META, "check.sensor.notParsed", { provider: ctx.ci.provider });
    return measured(META, {
      points: ctx.ci.hasTest ? 2 : 0,
      evidences: [evidence(ctx.ci.hasTest ? "check.3.4.found" : "check.3.4.none", "evidence")],
      summaryKey: ctx.ci.hasTest ? undefined : "check.3.4.none",
    });
  },
};
