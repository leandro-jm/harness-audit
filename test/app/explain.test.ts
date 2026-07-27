import { describe, it, expect, vi } from "vitest";
import { runExplain } from "../../src/app/explain.js";
import { ALL_CHECKS } from "../../src/checks/registry.js";
import { recommendationFor } from "../../src/recommendations/catalog.js";
import { setLang } from "../../src/i18n/index.js";

setLang("pt");

describe("harness-audit checks", () => {
  it("todo check tem fonte conceitual mapeada (integridade)", () => {
    for (const c of ALL_CHECKS) {
      expect(recommendationFor(c.id), `sem fonte: ${c.id}`).toBeDefined();
    }
  });

  it("lista todos os checks (exit 0)", () => {
    const spy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    expect(runExplain()).toBe(0);
    const out = spy.mock.calls.map((c) => String(c[0])).join("");
    expect(out).toContain("7.1");
    expect(out).toContain("8.1");
    spy.mockRestore();
  });

  it("detalha um check válido (exit 0) e erra id inexistente (exit 2)", () => {
    const spy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    expect(runExplain("7.1")).toBe(0);
    spy.mockRestore();
    const errSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    expect(runExplain("9.9")).toBe(2);
    errSpy.mockRestore();
  });
});
