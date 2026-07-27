/**
 * Catálogo de recomendações. Cada check com lacuna recebe uma recomendação de ID
 * estável (R-<checkId>) com fonte conceitual rastreável (PRD §7.6, Apêndice B).
 * O texto vem do i18n em `rec.<checkId>`.
 */

export type Source = "bockeler" | "coala" | "sdd" | "harness" | "security";

export interface Recommendation {
  id: string; // R-1.4
  checkId: string; // 1.4
  source: Source;
  textKey: string; // rec.1.4
}

// Fonte conceitual por check (Apêndice B do PRD).
const SOURCE_BY_CHECK: Record<string, Source> = {
  "1.1": "sdd",
  "1.2": "sdd",
  "1.3": "sdd",
  "1.4": "sdd",
  "1.5": "sdd",
  "2.1": "bockeler",
  "2.2": "bockeler",
  "2.3": "bockeler",
  "2.4": "bockeler",
  "3.1": "bockeler",
  "3.2": "bockeler",
  "3.3": "bockeler",
  "3.4": "bockeler",
  "3.5": "bockeler",
  "3.6": "bockeler",
  "4.1": "bockeler",
  "4.2": "bockeler",
  "4.3": "bockeler",
  "4.4": "bockeler",
  "5.1": "coala",
  "5.2": "coala",
  "5.3": "coala",
  "6.1": "harness",
  "6.2": "harness",
  "6.3": "harness",
  "6.4": "harness",
  "7.1": "security",
  "7.2": "security",
  "7.3": "security",
  "7.4": "security",
  "7.5": "security",
  "7.6": "security",
  "7.7": "security",
  "8.1": "harness",
  "8.2": "harness",
  "8.3": "harness",
  "8.4": "harness",
};

export function recommendationFor(checkId: string): Recommendation | undefined {
  const source = SOURCE_BY_CHECK[checkId];
  if (!source) return undefined;
  return { id: `R-${checkId}`, checkId, source, textKey: `rec.${checkId}` };
}
