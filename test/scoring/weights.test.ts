import { describe, it, expect } from "vitest";
import { computeScore } from "../../src/scoring/engine.js";
import { dimensionWeight } from "../../src/scoring/weights.js";
import type { CheckResult } from "../../src/checks/types.js";
import type { DimensionId } from "../../src/core/types.js";

function measured(checkId: string, dimension: DimensionId, points: number): CheckResult {
  return {
    checkId,
    dimension,
    status: "measured",
    points,
    max: 2,
    seal: "evidencia",
    evidences: [],
  };
}

// D4 e D7 altos (2/2 → dim 4,0); demais baixos (0/2 → 0,0).
const RESULTS: CheckResult[] = [
  measured("1.1", "D1", 0),
  measured("2.1", "D2", 0),
  measured("3.1", "D3", 0),
  measured("4.1", "D4", 2),
  measured("5.1", "D5", 0),
  measured("6.1", "D6", 0),
  measured("7.1", "D7", 2),
];

describe("pesos por perfil (§14.2)", () => {
  it("built-by-ai é média simples (pesos uniformes)", () => {
    const s = computeScore(RESULTS, "built-by-ai");
    // duas dimensões em 4,0 e cinco em 0,0 → 8/7 ≈ 1,14
    expect(s.global).toBeCloseTo(8 / 7, 5);
  });

  it("uses-ai eleva o global ao pesar mais D4/D7 (as altas)", () => {
    const base = computeScore(RESULTS, "built-by-ai").global;
    const usesAi = computeScore(RESULTS, "uses-ai").global;
    expect(usesAi).toBeGreaterThan(base);
    // (4·1,5 + 4·1,5) / (5·1 + 1,5 + 1,5) = 12 / 8 = 1,5
    expect(usesAi).toBeCloseTo(12 / 8, 5);
  });

  it("sem perfil → uniforme (retrocompatível)", () => {
    expect(computeScore(RESULTS).global).toBeCloseTo(8 / 7, 5);
  });

  it("dimensionWeight: preset por perfil, default 1", () => {
    expect(dimensionWeight("uses-ai", "D7")).toBe(1.5);
    expect(dimensionWeight("built-by-ai", "D7")).toBe(1);
    expect(dimensionWeight(undefined, "D4")).toBe(1);
  });
});
