import type { DimensionId } from "../core/types.js";
import type { CheckResult, Seal } from "../checks/types.js";

export type MaturityLevel = "fe" | "improviso" | "instrumentado" | "regulado" | "dirigido";

export interface DimensionScore {
  dimension: DimensionId;
  /** 0..4, ou null quando nenhum check foi medido (fora da média global). */
  score: number | null;
  pointsObtained: number;
  pointsApplicable: number;
  /** Origens distintas que contribuíram (para o rótulo [evidência+autorrelato]). */
  seals: Seal[];
  /** Todos os resultados da dimensão (inclui not-applicable/not-prepared p/ o relatório). */
  results: CheckResult[];
}

export interface Score {
  /** Média simples das dimensões com score != null (0 se nenhuma). Valor cru, sem arredondar. */
  global: number;
  level: MaturityLevel;
  /** % dos pontos obtidos que vêm de evidência (0..100). */
  confidence: number;
  dimensions: DimensionScore[];
}
