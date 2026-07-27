import { describe, it, expect } from "vitest";
import { evaluateGate, DEFAULT_GATE_MIN } from "../../src/app/gate.js";
import type { Score } from "../../src/scoring/types.js";

function score(global: number): Score {
  return { global, level: "instrumentado", confidence: 100, dimensions: [] };
}

describe("evaluateGate", () => {
  it("passa quando score ≥ limiar", () => {
    expect(evaluateGate(score(2.5), 2.0).passed).toBe(true);
  });
  it("reprova quando score < limiar", () => {
    const r = evaluateGate(score(1.9), 2.0);
    expect(r.passed).toBe(false);
    expect(r.threshold).toBe(2.0);
    expect(r.actual).toBe(1.9);
  });
  it("usa o limiar padrão quando --min ausente", () => {
    expect(evaluateGate(score(DEFAULT_GATE_MIN), undefined).passed).toBe(true);
    expect(evaluateGate(score(DEFAULT_GATE_MIN - 0.01), undefined).passed).toBe(false);
  });
});
