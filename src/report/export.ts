import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { RepoContext } from "../context/repo-context.js";
import type { AuditResult } from "../app/run-audit.js";
import { buildMarkdownReport } from "./markdown.js";
import { buildScoreJson, serializeScoreJson } from "./json.js";
import { buildSnippet } from "./snippet.js";

export type ExportChoice = "md" | "json" | "snippet";

export const REPORT_MD = "HARNESS-REPORT.md";
export const REPORT_JSON = "harness-score.json";

export interface ExportResult {
  /** Caminhos absolutos escritos. */
  writtenFiles: string[];
  /** Diretório onde os arquivos foram escritos. */
  outDir: string;
  /** Snippet, se solicitado (impresso, não escrito). */
  snippet?: string;
}

/** Escreve os relatórios escolhidos. Nunca escreve o que não foi solicitado. */
export function writeReports(
  ctx: RepoContext,
  audit: AuditResult,
  choices: ExportChoice[],
  generatedAt: Date,
): ExportResult {
  const outDir = ctx.options.out ?? ctx.root;
  const writtenFiles: string[] = [];

  if (choices.includes("md")) {
    const p = join(outDir, REPORT_MD);
    writeFileSync(p, buildMarkdownReport(ctx, audit, generatedAt));
    writtenFiles.push(p);
  }
  if (choices.includes("json")) {
    const p = join(outDir, REPORT_JSON);
    writeFileSync(p, serializeScoreJson(buildScoreJson(ctx, audit, generatedAt.toISOString())));
    writtenFiles.push(p);
  }

  const result: ExportResult = { writtenFiles, outDir };
  if (choices.includes("snippet")) result.snippet = buildSnippet(audit.score);
  return result;
}

/** Nomes de relatório ainda não cobertos pelo .gitignore (para sugerir adição). */
export function missingGitignoreEntries(root: string, basenames: string[]): string[] {
  const giPath = join(root, ".gitignore");
  const content = existsSync(giPath) ? readFileSync(giPath, "utf8") : "";
  const lines = new Set(content.split("\n").map((l) => l.trim()));
  return basenames.filter((b) => !lines.has(b));
}

/** Acrescenta entradas ao .gitignore (com consentimento do usuário). */
export function appendGitignore(root: string, entries: string[]): void {
  const giPath = join(root, ".gitignore");
  const prev = existsSync(giPath) ? readFileSync(giPath, "utf8") : "";
  const prefix = prev.length > 0 && !prev.endsWith("\n") ? "\n" : "";
  const block = `${prefix}\n# Relatórios harness-audit\n${entries.join("\n")}\n`;
  writeFileSync(giPath, prev + block);
}
