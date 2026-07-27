import type { Score } from "../scoring/types.js";

/** Limiar padrão do gate (PRD §14.5) — score global mínimo para passar. */
export const DEFAULT_GATE_MIN = 2.0;

export interface GateResult {
  passed: boolean;
  /** Limiar efetivo aplicado. */
  threshold: number;
  /** Score global medido. */
  actual: number;
}

/**
 * Avalia o gate de higiene: o score global deve alcançar o limiar. Puro e
 * testável; o exit code (0/1) é derivado de `passed` no caminho headless.
 */
export function evaluateGate(score: Score, min?: number): GateResult {
  const threshold = min ?? DEFAULT_GATE_MIN;
  return {
    passed: score.global >= threshold,
    threshold,
    actual: score.global,
  };
}
