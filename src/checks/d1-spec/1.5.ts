import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { TASKS_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "1.5", dimension: "D1", kind: "self-report" };

/**
 * 1.5 · Tarefas derivam da spec.
 * Evidência primeiro: se há rastro de plan/tasks no repo, mede por evidência.
 * Senão cai no autorrelato (yes/partial/no). Sem resposta → fora do denominador.
 */
export const check15: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.1.5.title",
  run(ctx) {
    const tasks = ctx.files.find(TASKS_GLOBS);
    if (tasks.length > 0) {
      return measured(META, {
        points: 2,
        seal: "evidencia",
        evidences: tasks
          .slice(0, 3)
          .map((f) => evidence("check.1.5.artifact", "evidence", { file: f, params: { file: f } })),
      });
    }

    const answer = ctx.selfReport.tasksFromSpec;
    if (!ctx.selfReport.answered || answer == null) {
      return notApplicable(META, "check.1.5.unanswered");
    }
    const points = answer === "yes" ? 2 : answer === "partial" ? 1 : 0;
    return measured(META, {
      points,
      evidences: [evidence(`check.1.5.answer.${answer}`, "self-report")],
      summaryKey: points < 2 ? "check.1.5.weak" : undefined,
    });
  },
};
