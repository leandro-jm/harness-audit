import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { guideFreshness } from "../shared/guide.js";
import { hasInsufficientHistory } from "../../context/repo-context.js";

const META: CheckMeta = { id: "2.3", dimension: "D2", kind: "evidence" };

/**
 * 2.3 · Guia está fresco.
 * Commits no código desde a última edição do guia: 0–10 fresco (2) · 11–40
 * atenção (1) · >40 estale (0). Guia não rastreado → atenção (1).
 */
export const check23: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.2.3.title",
  async run(ctx) {
    const fresh = await guideFreshness(ctx);
    if (fresh.state === "none") {
      return notApplicable(META, "check.2.3.noGuide");
    }
    if (fresh.state === "untracked") {
      return measured(META, {
        points: 1,
        evidences: [evidence("check.2.3.untracked", "evidence")],
        summaryKey: "check.2.3.untracked",
      });
    }
    if (hasInsufficientHistory(ctx)) {
      return notApplicable(META, "check.2.3.noHistory");
    }

    const points = fresh.state === "fresh" ? 2 : fresh.state === "attention" ? 1 : 0;
    return measured(META, {
      points,
      evidences: [
        evidence(`check.2.3.${fresh.state}`, "evidence", { params: { commits: fresh.commitsSince } }),
      ],
      summaryKey: points < 2 ? "check.2.3.summary" : undefined,
      summaryParams: { commits: fresh.commitsSince },
    });
  },
};
