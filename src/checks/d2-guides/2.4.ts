import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { RULES_STYLE_GLOBS, ARCH_SENSOR_GLOBS } from "../patterns.js";
import { guideText } from "../shared/guide.js";

const META: CheckMeta = { id: "2.4", dimension: "D2", kind: "evidence" };

const CONVENTION_SECTION_RE =
  /##?\s*(conven[çc]|arquitetura|architecture|estilo|style|guidelines|padr[õo])/i;

/**
 * 2.4 · Regras de arquitetura/estilo declaradas.
 * Configs de estilo (.editorconfig, eslint, prettier, biome), config de arquitetura
 * (dependency-cruiser), ou uma seção de convenção no guia. Soma sinais até 2.
 */
export const check24: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.2.4.title",
  run(ctx) {
    const styleConfigs = ctx.files.find(RULES_STYLE_GLOBS);
    const archConfigs = ctx.files.find(ARCH_SENSOR_GLOBS);
    const hasConventionSection = CONVENTION_SECTION_RE.test(guideText(ctx));

    let points = 0;
    if (styleConfigs.length > 0) points++;
    if (archConfigs.length > 0 || hasConventionSection) points++;
    points = Math.min(2, points);

    const evidences = [];
    if (styleConfigs.length > 0)
      evidences.push(
        evidence("check.2.4.style", "evidence", {
          file: styleConfigs[0],
          params: { file: styleConfigs[0]! },
        }),
      );
    if (archConfigs.length > 0)
      evidences.push(
        evidence("check.2.4.arch", "evidence", {
          file: archConfigs[0],
          params: { file: archConfigs[0]! },
        }),
      );
    if (hasConventionSection) evidences.push(evidence("check.2.4.section", "evidence"));
    if (evidences.length === 0) evidences.push(evidence("check.2.4.none", "evidence"));

    return measured(META, {
      points,
      evidences,
      summaryKey: points < 2 ? "check.2.4.weak" : undefined,
    });
  },
};
