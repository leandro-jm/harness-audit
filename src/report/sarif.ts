import { t } from "../i18n/index.js";
import { NAME, VERSION } from "../version.js";
import type { AuditResult } from "../app/run-audit.js";
import { recommendationFor } from "../recommendations/catalog.js";
import { gapResults } from "./annotations.js";

const INFO_URI = "https://github.com/leandrojmartins/harness-audit";

/**
 * SARIF 2.1.0 — cada lacuna vira um `result` com ruleId `R-<id>`, para a aba
 * Security / code scanning do GitHub. 100% local: descreve o que foi lido, sem
 * executar scanners.
 */
export function buildSarif(audit: AuditResult): Record<string, unknown> {
  const rules = new Map<string, Record<string, unknown>>();
  const results = gapResults(audit).map((r) => {
    const ruleId = r.recommendationId!;
    const rec = recommendationFor(r.checkId);
    if (!rules.has(ruleId)) {
      rules.set(ruleId, {
        id: ruleId,
        name: `harness-${r.checkId}`,
        shortDescription: { text: t(`check.${r.checkId}.title`) },
        ...(rec ? { fullDescription: { text: t(rec.textKey) } } : {}),
        ...(rec ? { properties: { source: rec.source, checkId: r.checkId } } : {}),
      });
    }
    const message = r.summaryKey ? t(r.summaryKey, r.summaryParams) : t(`check.${r.checkId}.title`);
    const ev = r.evidences.find((e) => e.file != null);
    return {
      ruleId,
      level: "warning",
      message: { text: message },
      locations: ev?.file
        ? [
            {
              physicalLocation: {
                artifactLocation: { uri: ev.file },
                ...(ev.line ? { region: { startLine: ev.line } } : {}),
              },
            },
          ]
        : [],
    };
  });

  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: NAME,
            version: VERSION,
            informationUri: INFO_URI,
            rules: [...rules.values()],
          },
        },
        results,
      },
    ],
  };
}

export function serializeSarif(sarif: Record<string, unknown>): string {
  return JSON.stringify(sarif, null, 2) + "\n";
}
