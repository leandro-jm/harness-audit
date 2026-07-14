import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export interface CommitSpec {
  message: string;
  /** Arquivos a escrever antes do commit (path relativo → conteúdo). */
  files?: Record<string, string>;
  /** Trailers do corpo (ex.: { "Co-authored-by": "Claude <noreply@anthropic.com>" }). */
  trailers?: Record<string, string>;
  author?: { name: string; email: string };
  /** Offset em dias a partir da data base (determinístico, sem relógio real). */
  dayOffset?: number;
}

export interface FixtureSpec {
  /** Arquivos escritos no primeiro commit se `commits` não os cobrir. */
  commits: CommitSpec[];
}

const BASE_EPOCH = 1_704_067_200; // 2024-01-01T00:00:00Z, fixo p/ determinismo.
const DAY = 86_400;
const DEFAULT_AUTHOR = { name: "Dev Humano", email: "dev@example.com" };

function git(cwd: string, args: string[], env: Record<string, string> = {}): void {
  const res = spawnSync("git", args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
  if (res.status !== 0) {
    throw new Error(`git ${args.join(" ")} falhou: ${res.stderr || res.stdout}`);
  }
}

/** Materializa um repositório git determinístico em tmp e devolve o caminho. */
export function buildFixture(spec: FixtureSpec): string {
  const root = mkdtempSync(join(tmpdir(), "harness-fixture-"));
  git(root, ["init", "-q"]);
  git(root, ["config", "user.name", DEFAULT_AUTHOR.name]);
  git(root, ["config", "user.email", DEFAULT_AUTHOR.email]);
  git(root, ["config", "commit.gpgsign", "false"]);
  git(root, ["symbolic-ref", "HEAD", "refs/heads/main"]);

  spec.commits.forEach((commit, i) => {
    for (const [rel, content] of Object.entries(commit.files ?? {})) {
      const abs = join(root, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    }
    git(root, ["add", "-A"]);

    const author = commit.author ?? DEFAULT_AUTHOR;
    const date = `${BASE_EPOCH + (commit.dayOffset ?? i) * DAY} +0000`;
    const message = buildMessage(commit);

    git(
      root,
      ["commit", "-q", "--allow-empty", "-m", message, "--author", `${author.name} <${author.email}>`],
      {
        GIT_AUTHOR_DATE: date,
        GIT_COMMITTER_DATE: date,
        GIT_COMMITTER_NAME: author.name,
        GIT_COMMITTER_EMAIL: author.email,
      },
    );
  });

  return root;
}

function buildMessage(commit: CommitSpec): string {
  const trailers = Object.entries(commit.trailers ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return trailers ? `${commit.message}\n\n${trailers}` : commit.message;
}

export function cleanupFixture(root: string): void {
  rmSync(root, { recursive: true, force: true });
}

/** Trailer padrão de commit de agente (para checks D6). */
export const CLAUDE_TRAILER = { "Co-authored-by": "Claude <noreply@anthropic.com>" };
