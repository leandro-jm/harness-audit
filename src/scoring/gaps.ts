import type { CheckResult } from "../checks/types.js";
import { DIMENSIONS } from "../core/types.js";

export interface Gap {
  result: CheckResult;
  recommendationId: string;
  /** Déficit absoluto de pontos (max - points), usado para ordenar. */
  deficit: number;
}

const DIM_ORDER = new Map(DIMENSIONS.map((d, i) => [d, i]));

/**
 * Lacunas priorizadas: checks com recomendação (medidos com déficit, ou
 * not-prepared), ordenados por maior déficit, depois por ordem de dimensão/ID.
 */
export function topGaps(results: CheckResult[], n = 3): Gap[] {
  return results
    .filter((r) => r.recommendationId)
    .map((r) => ({ result: r, recommendationId: r.recommendationId!, deficit: r.max - r.points }))
    .sort((a, b) => {
      if (b.deficit !== a.deficit) return b.deficit - a.deficit;
      const dimDiff =
        (DIM_ORDER.get(a.result.dimension) ?? 0) - (DIM_ORDER.get(b.result.dimension) ?? 0);
      if (dimDiff !== 0) return dimDiff;
      return a.result.checkId.localeCompare(b.result.checkId);
    })
    .slice(0, n);
}
