import type { MaturityLevel } from "./types.js";

export interface LevelBand {
  level: MaturityLevel;
  /** Limite inferior (inclusivo) no float cru. */
  min: number;
}

// Faixas do PRD §7.5. O nível é calculado no float cru; a exibição arredonda a
// 1 casa. Limiares em números inteiros + 3.8 para Dirigido (decisão do plano).
export const BANDS: LevelBand[] = [
  { level: "dirigido", min: 3.8 },
  { level: "regulado", min: 3.0 },
  { level: "instrumentado", min: 2.0 },
  { level: "improviso", min: 1.0 },
  { level: "fe", min: 0.0 },
];

export function levelOf(global: number): MaturityLevel {
  for (const band of BANDS) {
    if (global >= band.min) return band.level;
  }
  return "fe";
}
