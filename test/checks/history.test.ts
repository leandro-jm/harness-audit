import { describe, it, expect } from "vitest";
import { isAgentCommit, isFixCommit } from "../../src/checks/shared/history.js";
import type { GitCommit } from "../../src/context/git.js";

function commit(partial: Partial<GitCommit>): GitCommit {
  return {
    sha: "abc",
    authorName: "Dev Humano",
    authorEmail: "dev@example.com",
    committedAt: 0,
    subject: "chore: algo",
    body: "",
    trailers: {},
    files: [],
    isMerge: false,
    parents: [],
    ...partial,
  };
}

describe("isAgentCommit — assinaturas ampliadas (F13/§14.4)", () => {
  it("trailer co-authored-by com agentes novos", () => {
    for (const who of ["Claude Code", "Cursor", "Devin", "Jules", "Tabnine", "CodeRabbit"]) {
      expect(
        isAgentCommit(commit({ trailers: { "co-authored-by": [`${who} <x@y.z>`] } })),
        who,
      ).toBe(true);
    }
  });
  it("novos trailer keys (on-behalf-of) e autor bot", () => {
    expect(isAgentCommit(commit({ trailers: { "on-behalf-of": ["Copilot <x@y.z>"] } }))).toBe(true);
    expect(isAgentCommit(commit({ authorName: "dependabot[bot]" }))).toBe(true);
    expect(isAgentCommit(commit({ authorEmail: "noreply@anthropic.com" }))).toBe(true);
  });
  it("commit humano comum não é agente", () => {
    expect(isAgentCommit(commit({ authorName: "Ana", authorEmail: "ana@x.co" }))).toBe(false);
  });
});

describe("isFixCommit", () => {
  it("reconhece prefixos de conserto (en + pt-BR)", () => {
    for (const s of ["fix: x", "hotfix: y", "corrige borda", "ajusta layout", "revert z"]) {
      expect(isFixCommit(commit({ subject: s })), s).toBe(true);
    }
    expect(isFixCommit(commit({ subject: "feat: novo" }))).toBe(false);
  });
});
