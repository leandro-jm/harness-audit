import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";

const META: CheckMeta = { id: "3.1", dimension: "D3", kind: "evidence" };

/**
 * 3.1 · CI existe e roda em PR.
 * 0 → sem CI · 1 → CI presente mas gatilho de PR não confirmado (provedor
 * ainda não parseado por completo, ou sem pull_request) · 2 → roda em PR.
 */
export const check31: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.3.1.title",
  run(ctx) {
    const ci = ctx.ci;

    if (ci.provider === "none") {
      return measured(META, {
        points: 0,
        evidences: [evidence("check.3.1.noCi", "evidence")],
        summaryKey: "check.3.1.noCi",
      });
    }

    if (!ci.fullyParsed) {
      // CI detectado (GitLab/Jenkins/…), mas na v0.1 não confirmamos o gatilho.
      return measured(META, {
        points: 1,
        evidences: [
          evidence("check.3.1.detectedNotParsed", "evidence", {
            params: { provider: ci.provider },
          }),
        ],
        summaryKey: "check.3.1.detectedNotParsed",
        summaryParams: { provider: ci.provider },
      });
    }

    if (ci.runsOnPullRequest) {
      return measured(META, {
        points: 2,
        evidences: ci.workflowFiles
          .slice(0, 5)
          .map((f) => evidence("check.3.1.onPr", "evidence", { file: f, params: { file: f } })),
      });
    }

    return measured(META, {
      points: 1,
      evidences: [evidence("check.3.1.noPrTrigger", "evidence")],
      summaryKey: "check.3.1.noPrTrigger",
    });
  },
};
