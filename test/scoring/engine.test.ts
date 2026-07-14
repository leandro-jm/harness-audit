import { describe, it, expect } from "vitest";
import { computeScore } from "../../src/scoring/engine.js";
import { levelOf } from "../../src/scoring/levels.js";
import type { CheckResult, CheckStatus, Seal } from "../../src/checks/types.js";
import type { DimensionId } from "../../src/core/types.js";

function mk(
  dimension: DimensionId,
  status: CheckStatus,
  points: number,
  max = 2,
  seal: Seal = "evidencia",
): CheckResult {
  return { checkId: `${dimension}.x`, dimension, status, points, max, seal, evidences: [] };
}

describe("levelOf — fronteiras de banda", () => {
  it.each([
    [0.0, "fe"],
    [0.9, "fe"],
    [0.99, "fe"],
    [1.0, "improviso"],
    [1.9, "improviso"],
    [2.0, "instrumentado"],
    [2.9, "instrumentado"],
    [3.0, "regulado"],
    [3.7, "regulado"],
    [3.79, "regulado"],
    [3.8, "dirigido"],
    [4.0, "dirigido"],
  ])("%f → %s", (value, expected) => {
    expect(levelOf(value)).toBe(expected);
  });
});

describe("computeScore — normalização por dimensão", () => {
  it("(obtidos/aplicáveis)×4 — 3/8 → 1,5", () => {
    const results = [
      mk("D1", "measured", 2),
      mk("D1", "measured", 1),
      mk("D1", "measured", 0),
      mk("D1", "measured", 0),
    ];
    const score = computeScore(results);
    const d1 = score.dimensions.find((d) => d.dimension === "D1")!;
    expect(d1.pointsObtained).toBe(3);
    expect(d1.pointsApplicable).toBe(8);
    expect(d1.score).toBeCloseTo(1.5, 5);
  });

  it("dimensão perfeita → 4,0", () => {
    const score = computeScore([mk("D2", "measured", 2), mk("D2", "measured", 2)]);
    expect(score.dimensions.find((d) => d.dimension === "D2")!.score).toBeCloseTo(4, 5);
  });
});

describe("computeScore — exclusão do denominador", () => {
  it("not-applicable e not-prepared saem do denominador (não viram zero)", () => {
    const results = [
      mk("D1", "measured", 2), // 2/2
      mk("D1", "not-applicable", 0), // ignorado
      mk("D1", "not-prepared", 0), // ignorado
    ];
    const d1 = computeScore(results).dimensions.find((d) => d.dimension === "D1")!;
    expect(d1.pointsApplicable).toBe(2);
    expect(d1.score).toBeCloseTo(4, 5);
  });

  it("dimensão só com not-applicable → score null e fora da média global", () => {
    const results = [mk("D1", "not-applicable", 0), mk("D2", "measured", 2)];
    const score = computeScore(results);
    expect(score.dimensions.find((d) => d.dimension === "D1")!.score).toBeNull();
    // Global = média apenas de D2 (4,0)
    expect(score.global).toBeCloseTo(4, 5);
  });
});

describe("computeScore — global e confiança", () => {
  it("global = média simples das dimensões medidas", () => {
    // D1 = 4 (2/2), D3 = 2 (1/2) → média 3
    const score = computeScore([mk("D1", "measured", 2), mk("D3", "measured", 1)]);
    expect(score.global).toBeCloseTo(3, 5);
  });

  it("confiança = pontos de evidência / pontos obtidos", () => {
    // 2 pontos de evidência + 2 de autorrelato → 50%
    const score = computeScore([
      mk("D1", "measured", 2, 2, "evidencia"),
      mk("D6", "measured", 2, 2, "autorrelato"),
    ]);
    expect(score.confidence).toBe(50);
  });

  it("proxy também rebaixa a confiança", () => {
    const score = computeScore([
      mk("D1", "measured", 3, 4, "evidencia"),
      mk("D6", "measured", 1, 2, "proxy"),
    ]);
    // evidência 3 / obtidos 4 = 75%
    expect(score.confidence).toBe(75);
  });

  it("sem pontos obtidos → confiança 100 (guarda de divisão)", () => {
    const score = computeScore([mk("D1", "measured", 0)]);
    expect(score.confidence).toBe(100);
    expect(score.global).toBeCloseTo(0, 5);
    expect(score.level).toBe("fe");
  });

  it("resultados vazios → global 0, nível fe, seis dimensões null", () => {
    const score = computeScore([]);
    expect(score.global).toBe(0);
    expect(score.level).toBe("fe");
    expect(score.dimensions).toHaveLength(6);
    expect(score.dimensions.every((d) => d.score === null)).toBe(true);
  });
});

describe("computeScore — selos por dimensão", () => {
  it("agrega selos distintos em ordem canônica", () => {
    const score = computeScore([
      mk("D4", "measured", 1, 2, "autorrelato"),
      mk("D4", "measured", 2, 2, "evidencia"),
    ]);
    expect(score.dimensions.find((d) => d.dimension === "D4")!.seals).toEqual([
      "evidencia",
      "autorrelato",
    ]);
  });
});
