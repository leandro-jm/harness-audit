import { DIMENSIONS, type Profile } from "../core/types.js";
import type { CheckResult, Seal } from "../checks/types.js";
import { checkWeight } from "../checks/registry.js";
import { levelOf } from "./levels.js";
import { dimensionWeight } from "./weights.js";
import type { DimensionScore, Score } from "./types.js";

const SEAL_ORDER: Seal[] = ["evidencia", "proxy", "autorrelato"];

/**
 * Calcula o Harness Score a partir dos resultados dos checks (PRD §7.5).
 *
 * - Só checks `measured` entram no denominador. not-applicable/not-prepared saem
 *   (nunca viram zero punitivo).
 * - Por dimensão: (pontos obtidos / pontos aplicáveis) × 4, ponderando cada check
 *   por `Check.weight` (uniforme hoje). null se nada medido.
 * - Global: média das dimensões com score != null, ponderada por perfil (§14.2).
 *   Sem perfil (ou `built-by-ai`), pesos uniformes → média simples.
 * - Confiança: % dos pontos OBTIDOS que vêm de evidência (não ponderado).
 */
export function computeScore(results: CheckResult[], profile?: Profile): Score {
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
      const w = checkWeight(r.checkId);
      obtained += r.points * w;
      applicable += r.max * w;
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
  let weightedSum = 0;
  let weightTotal = 0;
  for (const d of scored) {
    const w = dimensionWeight(profile, d.dimension);
    weightedSum += d.score * w;
    weightTotal += w;
  }
  const global = weightTotal > 0 ? weightedSum / weightTotal : 0;

  const confidence =
    totalObtained > 0 ? Math.round((evidenceObtained / totalObtained) * 100) : 100;

  return {
    global,
    level: levelOf(global),
    confidence,
    dimensions,
  };
}
