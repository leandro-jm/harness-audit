import type { RepoContext } from "../../context/repo-context.js";

/**
 * Presença de dependência por nome, agnóstico de stack: procura em deps JS
 * (package.json) e no texto de manifestos Python (pyproject/requirements). Usado
 * pela trilha de runtime harness (D8), que é 100% estática.
 */
export function hasDep(ctx: RepoContext, names: string[]): boolean {
  const js = ctx.pkg?.allDepNames ?? [];
  if (js.some((d) => names.includes(d))) return true;

  const py =
    (ctx.files.read("pyproject.toml") ?? "") +
    "\n" +
    (ctx.files.read("requirements.txt") ?? "");
  if (py.length === 0) return false;
  return names.some((n) => new RegExp(`(^|[^\\w.-])${escapeRe(n)}([^\\w-]|$)`, "m").test(py));
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** SDKs de LLM (indício de app que USA IA em runtime). */
export const LLM_SDK_DEPS = [
  "openai",
  "anthropic",
  "@anthropic-ai/sdk",
  "@ai-sdk/openai",
  "ai",
  "langchain",
  "@langchain/core",
  "llama-index",
  "llama_index",
  "litellm",
  "cohere",
  "@google/generative-ai",
  "google-generativeai",
];

/** Observabilidade / rastreio de custo de LLM (8.3). */
export const OBSERVABILITY_DEPS = [
  "langsmith",
  "langfuse",
  "@langfuse/node",
  "helicone",
  "@helicone/helpers",
  "openllmetry",
  "@traceloop/node-server-sdk",
  "traceloop-sdk",
  "arize-phoenix",
  "phoenix",
  "wandb",
];

/** Guardrails de tool use / saída (8.4). */
export const GUARDRAIL_DEPS = [
  "guardrails-ai",
  "nemoguardrails",
  "@guardrails-ai/core",
  "llm-guard",
  "rebuff",
];

/** Frameworks de avaliação (evals) de LLM (8.1). */
export const EVAL_DEPS = ["promptfoo", "deepeval", "ragas", "evalite", "autoevals", "@promptfoo/core"];
