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

// Assinaturas de agentes de código em trailers/autores (PRD §14.4).
const AGENT_RE =
  /(claude(?:\s*code)?|copilot|cursor|codeium|gemini(?:\s*code\s*assist)?|jules|devin|aider|windsurf|amazon\s*q|sourcegraph|cody|openai|chatgpt|gpt-|tabnine|sweep|coderabbit|continue\.dev|zencoder|codegen|bito|augment)/i;
const AGENT_TRAILER_KEYS = [
  "co-authored-by",
  "assisted-by",
  "generated-by",
  "co-committed-by",
  "on-behalf-of",
];
// E-mails de bots de agente conhecidos (além do sufixo genérico "[bot]").
const AGENT_BOT_EMAIL_RE =
  /noreply@anthropic\.com|@users\.noreply\.github\.com.*copilot|devin-ai|cursor\.com|sourcegraph\.com/i;

/** Commit atribuído (parcial ou totalmente) a um agente de código. */
export function isAgentCommit(c: GitCommit): boolean {
  for (const key of AGENT_TRAILER_KEYS) {
    const vals = c.trailers[key];
    if (vals && vals.some((v) => AGENT_RE.test(v))) return true;
  }
  if (/\[bot\]/i.test(c.authorName) || /\[bot\]/i.test(c.authorEmail)) return true;
  if (AGENT_RE.test(c.authorName) || AGENT_BOT_EMAIL_RE.test(c.authorEmail)) return true;
  return false;
}

// Prefixos de "conserto" — conventional commits + pt-BR.
const FIX_RE = /^(fix|hotfix|bugfix|revert|patch|ajust|corrig|corre[cç])/i;

/** Commit de correção/conserto (pela mensagem). */
export function isFixCommit(c: GitCommit): boolean {
  return FIX_RE.test(c.subject.trim());
}
