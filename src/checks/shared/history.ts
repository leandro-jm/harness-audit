import type { RepoContext } from "../../context/repo-context.js";
import type { GitCommit } from "../../context/git.js";

// Cache por contexto: 6.1 e 6.2 compartilham a mesma janela de log (evita 2x git log).
const cache = new WeakMap<RepoContext, Promise<GitCommit[]>>();

/** Commits recentes (com arquivos), memoizados por contexto. Ordem: mais novo → mais antigo. */
export function recentCommits(ctx: RepoContext, max = 300): Promise<GitCommit[]> {
  let p = cache.get(ctx);
  if (!p) {
    p = ctx.git.log({ maxCount: max, withFiles: true });
    cache.set(ctx, p);
  }
  return p;
}

// Assinaturas de agentes de código em trailers/autores.
const AGENT_RE =
  /(claude|copilot|cursor|codeium|gemini|devin|aider|windsurf|amazon\s*q|sourcegraph|cody|openai|gpt-)/i;
const AGENT_TRAILER_KEYS = ["co-authored-by", "assisted-by", "generated-by", "co-committed-by"];

/** Commit atribuído (parcial ou totalmente) a um agente de código. */
export function isAgentCommit(c: GitCommit): boolean {
  for (const key of AGENT_TRAILER_KEYS) {
    const vals = c.trailers[key];
    if (vals && vals.some((v) => AGENT_RE.test(v))) return true;
  }
  if (/\[bot\]/i.test(c.authorName) || /\[bot\]/i.test(c.authorEmail)) return true;
  return false;
}

// Prefixos de "conserto" — conventional commits + pt-BR.
const FIX_RE = /^(fix|hotfix|bugfix|revert|patch|ajust|corrig|corre[cç])/i;

/** Commit de correção/conserto (pela mensagem). */
export function isFixCommit(c: GitCommit): boolean {
  return FIX_RE.test(c.subject.trim());
}
