import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notPrepared, type CheckMeta } from "../result.js";
import { guideFreshness } from "../shared/guide.js";

const META: CheckMeta = { id: "5.1", dimension: "D5", kind: "evidence" };

/**
 * 5.1 · Memória procedural viva (CoALA).
 * Reaproveita 2.1 + 2.3 com peso próprio: guia EXISTE e está FRESCO. fresco → 2 ·
 * atenção/não-rastreado → 1 · estale → 0. Sem guia → 0 (ou not-prepared convencional).
 */
export const check51: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.5.1.title",
  async run(ctx) {
    const fresh = await guideFreshness(ctx);
    if (fresh.state === "none") {
      if (ctx.profile === "conventional") return notPrepared(META, "check.5.1.notPrepared");
      return measured(META, {
        points: 0,
        evidences: [evidence("check.5.1.noGuide", "evidence")],
        summaryKey: "check.5.1.noGuide",
      });
    }

    const points =
      fresh.state === "fresh" ? 2 : fresh.state === "stale" ? 0 : 1; // untracked/attention → 1
    return measured(META, {
      points,
      evidences: [
        evidence(`check.5.1.${fresh.state}`, "evidence", {
          params: { commits: fresh.commitsSince },
        }),
      ],
      summaryKey: points < 2 ? "check.5.1.summary" : undefined,
      summaryParams: { commits: fresh.commitsSince },
    });
  },
};
