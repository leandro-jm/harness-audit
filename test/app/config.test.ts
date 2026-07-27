import { describe, it, expect } from "vitest";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig, mergeConfig } from "../../src/app/config.js";

function withConfig(content: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), "harness-cfg-"));
  writeFileSync(join(dir, ".harnessrc.json"), JSON.stringify(content));
  return dir;
}

describe("config de projeto", () => {
  it("lê só as chaves permitidas (ignora tentativas de burlar o score)", () => {
    const dir = withConfig({
      profile: "uses-ai",
      min: 2.5,
      gate: true,
      lang: "en",
      ignoreChecks: ["7.1"], // NÃO permitido
      weights: { D7: 10 }, // NÃO permitido
    });
    const cfg = loadConfig(dir);
    expect(cfg).toEqual({ profile: "uses-ai", min: 2.5, gate: true, lang: "en" });
    expect("ignoreChecks" in cfg).toBe(false);
    expect("weights" in cfg).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });

  it("mergeConfig: flags de CLI vencem a config", () => {
    const cfg = { profile: "conventional", min: 3, gate: true };
    const merged = mergeConfig({ profile: "uses-ai" }, cfg);
    expect(merged.profile).toBe("uses-ai"); // CLI vence
    expect(merged.min).toBe("3"); // da config
    expect(merged.gate).toBe(true);
  });

  it("sem arquivo de config → objeto vazio", () => {
    const dir = mkdtempSync(join(tmpdir(), "harness-noc-"));
    expect(loadConfig(dir)).toEqual({});
    rmSync(dir, { recursive: true, force: true });
  });
});
