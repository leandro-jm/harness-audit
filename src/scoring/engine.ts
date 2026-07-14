import { DIMENSIONS } from "../core/types.js";
import type { CheckResult, Seal } from "../checks/types.js";
import { levelOf } from "./levels.js";
import type { DimensionScore, Score } from "./types.js";

const SEAL_ORDER: Seal[] = ["evidencia", "proxy", "autorrelato"];

/**
 * Calcula o Harness Score a partir dos resultados dos checks (PRD §7.5).
 *
 * - Só checks `measured` entram no denominador. not-applicable/not-prepared saem
 *   (nunca viram zero punitivo).
 * - Por dimensão: (pontos obtidos / pontos aplicáveis) × 4; null se nada medido.
 * - Global: média simples das dimensões com score != null.
 * - Confiança: % dos pontos OBTIDOS que vêm de evidência.
 */
export function computeScore(results: CheckResult[]): Score {
  const dimensions: DimensionScore[] = [];
  let evidenceObtained = 0;
  let totalObtained = 0;

  for (const dimId of DIMENSIONS) {
    const dimResults = results.filter((r) => r.dimension === dimId);
    const measured = dimResults.filter((r) => r.status === "measured");

    let obtained = 0;
    let applicable = 0;
    const seals = new Set<Seal>();
    for (const r of measured) {
      obtained += r.points;
      applicable += r.max;
      seals.add(r.seal);
      totalObtained += r.points;
      if (r.seal === "evidencia") evidenceObtained += r.points;
    }

    dimensions.push({
      dimension: dimId,
      score: applicable > 0 ? (obtained / applicable) * 4 : null,
      pointsObtained: obtained,
      pointsApplicable: applicable,
      seals: SEAL_ORDER.filter((s) => seals.has(s)),
      results: dimResults,
    });
  }

  const scored = dimensions.filter((d) => d.score !== null) as Array<
    DimensionScore & { score: number }
  >;
  const global =
    scored.length > 0 ? scored.reduce((sum, d) => sum + d.score, 0) / scored.length : 0;

  const confidence =
    totalObtained > 0 ? Math.round((evidenceObtained / totalObtained) * 100) : 100;

  return {
    global,
    level: levelOf(global),
    confidence,
    dimensions,
  };
}
