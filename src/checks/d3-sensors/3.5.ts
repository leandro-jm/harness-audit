import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { ARCH_SENSOR_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "3.5", dimension: "D3", kind: "evidence" };

// Dependências que indicam checagem de fronteiras de módulo.
const ARCH_DEPS = [
  "dependency-cruiser",
  "eslint-plugin-boundaries",
  "eslint-plugin-import",
  "@nx/enforce-module-boundaries",
  "good-fences",
];

/**
 * 3.5 · Sensor de arquitetura (fronteiras de módulo).
 * Config de dependency-cruiser ou deps de boundaries/ArchUnit. Presente → 2, senão 0.
 */
export const check35: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.3.5.title",
  run(ctx) {
    const configs = ctx.files.find(ARCH_SENSOR_GLOBS);
    const deps = ctx.pkg?.allDepNames ?? [];
    const matchedDep = ARCH_DEPS.find((d) => deps.includes(d));

    const present = configs.length > 0 || matchedDep != null;
    const evidences = [];
    if (configs.length > 0)
      evidences.push(
        evidence("check.3.5.config", "evidence", {
          file: configs[0],
          params: { file: configs[0]! },
        }),
      );
    if (matchedDep)
      evidences.push(evidence("check.3.5.dep", "evidence", { params: { dep: matchedDep } }));
    if (!present) evidences.push(evidence("check.3.5.none", "evidence"));

    return measured(META, {
      points: present ? 2 : 0,
      evidences,
      summaryKey: present ? undefined : "check.3.5.none",
    });
  },
};
