import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, notPrepared, type CheckMeta } from "../result.js";
import { hasInsufficientHistory } from "../../context/repo-context.js";
import { recentCommits, isAgentCommit, isFixCommit } from "../shared/history.js";

const META: CheckMeta = { id: "6.1", dimension: "D6", kind: "proxy" };

const LOOKAHEAD = 8; // commits humanos após o commit do agente

/**
 * 6.1 · Correção manual crônica (proxy).
 * Detecta commits de agente (trailers Co-authored-by, autores bot) e mede a taxa
 * de fixes humanos logo depois, sobre arquivos que o agente tocou. Taxa alta =
 * correção crônica → nota baixa. <20% → 2 · 20–50% → 1 · >50% → 0.
 */
export const check61: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.6.1.title",
  async run(ctx) {
    if (hasInsufficientHistory(ctx)) return notApplicable(META, "check.6.1.noHistory");

    // Ordena do mais antigo para o mais novo.
    const commits = (await recentCommits(ctx)).slice().reverse();
    const agentIdx: number[] = [];
    commits.forEach((c, i) => {
      if (isAgentCommit(c)) agentIdx.push(i);
    });

    if (agentIdx.length === 0) {
      if (ctx.profile === "conventional") return notPrepared(META, "check.6.1.noAgentConventional");
      return notApplicable(META, "check.6.1.noAgent");
    }

    let followUps = 0;
    for (const i of agentIdx) {
      const agentFiles = new Set(commits[i]!.files);
      for (let j = i + 1; j < commits.length && j <= i + LOOKAHEAD; j++) {
        const nc = commits[j]!;
        if (isAgentCommit(nc)) continue; // só fixes humanos contam
        if (isFixCommit(nc) && nc.files.some((f) => agentFiles.has(f))) {
          followUps++;
          break;
        }
      }
    }

    const rate = followUps / agentIdx.length;
    const pct = Math.round(rate * 100);
    const points = rate < 0.2 ? 2 : rate <= 0.5 ? 1 : 0;

    return measured(META, {
      points,
      evidences: [
        evidence("check.6.1.rate", "proxy", {
          params: { followUps, agents: agentIdx.length, pct },
        }),
      ],
      summaryKey: points < 2 ? "check.6.1.summary" : undefined,
      summaryParams: { pct },
    });
  },
};
