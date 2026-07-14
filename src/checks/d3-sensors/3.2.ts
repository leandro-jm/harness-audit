import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";

const META: CheckMeta = { id: "3.2", dimension: "D3", kind: "evidence" };

/** 3.2 · Sensor de estilo (lint) no CI. Depende de um CI parseável (senão N/A). */
export const check32: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.3.2.title",
  run(ctx) {
    if (ctx.ci.provider === "none") return notApplicable(META, "check.sensor.noCi");
    if (!ctx.ci.fullyParsed)
      return notApplicable(META, "check.sensor.notParsed", { provider: ctx.ci.provider });
    return measured(META, {
      points: ctx.ci.hasLint ? 2 : 0,
      evidences: [evidence(ctx.ci.hasLint ? "check.3.2.found" : "check.3.2.none", "evidence")],
      summaryKey: ctx.ci.hasLint ? undefined : "check.3.2.none",
    });
  },
};
