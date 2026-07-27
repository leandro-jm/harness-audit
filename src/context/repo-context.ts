import { resolve } from "node:path";
import type { Lang, Profile, RunOptions } from "../core/types.js";
import type { SelfReportAnswers } from "../self-report/types.js";
import { EMPTY_SELF_REPORT } from "../self-report/types.js";
import { loadGit, type GitInfo } from "./git.js";
import { loadFileIndex, type FileIndex } from "./file-index.js";
import { loadPackageJson, type PackageJsonInfo } from "./package-json.js";
import { detectStack, type StackInfo } from "./stack.js";
import { detectCi } from "./ci/ci-detect.js";
import type { CiModel } from "./ci/ci-model.js";
import { loadGithubProtection, type GithubProtection } from "./github.js";

/** Aviso de contexto que degrada a cobertura (stack parcial, histórico raso…). */
export interface ContextNote {
  kind: "stack-partial" | "shallow-history" | "no-package-json" | "workspaces";
  /** Chave de mensagem i18n (resolvida na renderização). */
  messageKey: string;
  params?: Record<string, string | number>;
}

/**
 * A única superfície de leitura que todos os checks consomem. Construída uma vez
 * por execução; somente leitura sobre o repositório auditado.
 */
export interface RepoContext {
  root: string;
  profile: Profile;
  lang: Lang;
  options: RunOptions;
  git: GitInfo;
  files: FileIndex;
  pkg?: PackageJsonInfo;
  stack: StackInfo;
  ci: CiModel;
  /** Branch protection lida via --github (opt-in). undefined = não consultado/indisponível. */
  github?: GithubProtection;
  selfReport: SelfReportAnswers;
  notes: ContextNote[];
}

/** Abaixo deste nº de commits, checks de histórico degradam (proxy pouco confiável). */
export const MIN_HISTORY_COMMITS = 5;

/**
 * Carrega todo o contexto de leitura do repositório. `profile` pode ser provisório
 * (ex.: default) nesta fase; o wizard o reafirma antes de rodar os checks.
 */
export async function loadRepoContext(options: RunOptions): Promise<RepoContext> {
  const root = resolve(options.path);

  // Índice de arquivos primeiro (git e stack dependem dele).
  const files = await loadFileIndex(root);
  const git = await loadGit(root);
  const pkg = loadPackageJson(files);
  const stack = detectStack(files, pkg);
  const ci = detectCi(files);

  // --github (opt-in): única consulta de rede, degradando para undefined.
  const github =
    options.github && git.isRepo
      ? (loadGithubProtection(git.branch, root) ?? undefined)
      : undefined;

  const notes: ContextNote[] = [];
  if (!stack.supported) {
    notes.push({
      kind: "stack-partial",
      messageKey: "note.stackPartial",
      params: { primary: stack.primary },
    });
  }
  if (git.isRepo && (git.isShallow || git.commitCount < MIN_HISTORY_COMMITS)) {
    notes.push({
      kind: "shallow-history",
      messageKey: "note.shallowHistory",
      params: { commits: git.commitCount },
    });
  }
  if (!pkg && stack.primary !== "python" && stack.primary !== "go") {
    notes.push({ kind: "no-package-json", messageKey: "note.noPackageJson" });
  }
  if (pkg?.hasWorkspaces) {
    notes.push({ kind: "workspaces", messageKey: "note.workspaces" });
  }

  return {
    root,
    profile: options.profile ?? "built-by-ai",
    lang: options.lang,
    options,
    git,
    files,
    pkg,
    stack,
    ci,
    github,
    selfReport: EMPTY_SELF_REPORT,
    notes,
  };
}

/** true quando checks dependentes de histórico devem sair do denominador. */
export function hasInsufficientHistory(ctx: RepoContext): boolean {
  return !ctx.git.isRepo || ctx.git.isShallow || ctx.git.commitCount < MIN_HISTORY_COMMITS;
}
