import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { PROMPT_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "8.2", dimension: "D8", kind: "evidence" };

/**
 * 8.2 · Prompts versionados (trilha de runtime harness). Prompts como artefato no
 * repo (não hardcoded/soltos) são o "feedforward" do harness de runtime.
 * 0 = sem prompts versionados · 2 = prompts como arquivo no repo.
 */
export const check82: Check = {
  ...META,
  profiles: ["uses-ai", "both"],
  weight: 1,
  titleKey: "check.8.2.title",
  run(ctx) {
    const prompt = ctx.files.find(PROMPT_GLOBS)[0];
    if (prompt) {
      return measured(META, {
        points: 2,
        evidences: [evidence("check.8.2.found", "evidence", { file: prompt, params: { file: prompt } })],
      });
    }
    return measured(META, {
      points: 0,
      evidences: [evidence("check.8.2.none", "evidence")],
      summaryKey: "check.8.2.none",
    });
  },
};
