import { describe, it, expect } from "vitest";
import { buildBadgeSvg } from "../../src/report/badge.js";
import { setLang } from "../../src/i18n/index.js";
import type { Score } from "../../src/scoring/types.js";

setLang("pt");

function score(global: number, level: Score["level"]): Score {
  return { global, level, confidence: 90, dimensions: [] };
}

describe("buildBadgeSvg", () => {
  it("gera SVG auto-contido com score, nível e sem rede", () => {
    const svg = buildBadgeSvg(score(2.5, "instrumentado"));
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("2,5/4 · Instrumentado");
    expect(svg).toContain("harness");
    // Zero rede: nenhuma referência http externa a não ser o namespace SVG.
    expect(svg.includes("http://www.w3.org/2000/svg")).toBe(true);
    expect(/https?:\/\/(?!www\.w3\.org)/.test(svg)).toBe(false);
  });

  it("cor por banda: baixa = vermelho · alta = verde", () => {
    expect(buildBadgeSvg(score(0.5, "fe"))).toContain("#e05d44");
    expect(buildBadgeSvg(score(3.9, "dirigido"))).toContain("#4c1");
  });
});
