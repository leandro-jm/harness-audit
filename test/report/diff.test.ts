import { describe, it, expect } from "vitest";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadBaseline, computeDiff } from "../../src/report/diff.js";
import type { Score } from "../../src/scoring/types.js";

function score(global: number, dims: Array<[string, number | null]>): Score {
  return {
    global,
    level: "instrumentado",
    confidence: 100,
    dimensions: dims.map(([dimension, s]) => ({
      dimension: dimension as Score["dimensions"][number]["dimension"],
      score: s,
      pointsObtained: 0,
      pointsApplicable: 0,
      seals: [],
      results: [],
    })),
  };
}

function writeBaseline(content: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), "harness-diff-"));
  const file = join(dir, "harness-score.json");
  writeFileSync(file, JSON.stringify(content));
  return file;
}

describe("loadBaseline / computeDiff", () => {
  it("carrega baseline válido e calcula deltas por dimensão", () => {
    const file = writeBaseline({
      schemaVersion: "2.0.0",
      score: {
        global: 2.0,
        dimensions: [
          { id: "D1", score: 1.0 },
          { id: "D7", score: 2.0 },
        ],
      },
    });
    const base = loadBaseline(file)!;
    expect(base.global).toBe(2.0);
    const diff = computeDiff(score(2.5, [["D1", 2.0], ["D7", 3.0]]), base);
    expect(diff.globalDelta).toBeCloseTo(0.5, 5);
    expect(diff.dims.find((d) => d.id === "D1")!.delta).toBeCloseTo(1.0, 5);
    expect(diff.schemaMismatch).toBe(false);
    rmSync(file, { recursive: true, force: true });
  });

  it("marca mismatch quando o major do schema difere (1.x → 2.x)", () => {
    const file = writeBaseline({ schemaVersion: "1.0.0", score: { global: 3.0, dimensions: [] } });
    const diff = computeDiff(score(2.4, [["D1", 1.0]]), loadBaseline(file)!);
    expect(diff.schemaMismatch).toBe(true);
    rmSync(file, { recursive: true, force: true });
  });

  it("retorna null para arquivo ausente ou inválido", () => {
    expect(loadBaseline("/caminho/inexistente.json")).toBeNull();
    const bad = writeBaseline({ nope: true });
    expect(loadBaseline(bad)).toBeNull();
    rmSync(bad, { recursive: true, force: true });
  });
});
