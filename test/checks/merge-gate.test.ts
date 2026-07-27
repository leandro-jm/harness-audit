import { describe, it, expect } from "vitest";
import { mergeGate } from "../../src/checks/shared/merge-gate.js";
import type { RepoContext } from "../../src/context/repo-context.js";
import type { GithubProtection } from "../../src/context/github.js";
import type { SelfReportAnswers } from "../../src/self-report/types.js";

function ctx(github?: GithubProtection, selfReport?: SelfReportAnswers): RepoContext {
  return {
    github,
    selfReport: selfReport ?? { answered: false },
  } as unknown as RepoContext;
}

describe("mergeGate — evidência (--github) tem prioridade sobre autorrelato", () => {
  it("github com required checks → bloqueia, fonte evidência", () => {
    const g = mergeGate(ctx({ protectionExists: true, blocksMerge: true, requiresReview: true }));
    expect(g).toEqual({ blocks: true, source: "evidence" });
  });
  it("github sem proteção → não bloqueia, fonte evidência (sobrepõe autorrelato)", () => {
    const g = mergeGate(
      ctx(
        { protectionExists: false, blocksMerge: false, requiresReview: false },
        { answered: true, sensorsBlockMerge: "block" },
      ),
    );
    expect(g).toEqual({ blocks: false, source: "evidence" });
  });
  it("sem github → cai para autorrelato", () => {
    expect(mergeGate(ctx(undefined, { answered: true, sensorsBlockMerge: "block" }))).toEqual({
      blocks: true,
      source: "self-report",
    });
    expect(mergeGate(ctx(undefined, { answered: true, sensorsBlockMerge: "inform" }))).toEqual({
      blocks: false,
      source: "self-report",
    });
  });
  it("desconhecido/não respondido → blocks null", () => {
    expect(mergeGate(ctx(undefined, { answered: false })).blocks).toBeNull();
    expect(mergeGate(ctx(undefined, { answered: true, sensorsBlockMerge: "unknown" })).blocks).toBeNull();
  });
});
