import { simpleGit, type SimpleGit } from "simple-git";

/** Um commit já parseado, com trailers e arquivos alterados prontos para uso. */
export interface GitCommit {
  sha: string;
  authorName: string;
  authorEmail: string;
  /** Unix timestamp em segundos (author date). */
  committedAt: number;
  subject: string;
  body: string;
  /** Trailers do corpo, ex.: { "co-authored-by": ["Claude <...>"] } (chaves em minúsculas). */
  trailers: Record<string, string[]>;
  /** Caminhos (relativos à raiz) alterados neste commit. Vazio se não solicitado. */
  files: string[];
  isMerge: boolean;
  parents: string[];
}

export interface GitLogOptions {
  maxCount?: number;
  noMerges?: boolean;
  /** Inclui a lista de arquivos alterados (via --name-only). Mais lento. */
  withFiles?: boolean;
}

/**
 * Fachada de leitura do histórico git. Toda consulta de história passa por
 * aqui — ponto único, testável e trocável. Somente leitura: nunca escreve.
 */
export interface GitInfo {
  isRepo: boolean;
  isShallow: boolean;
  commitCount: number;
  branch: string;
  repoName: string;
  log(opts?: GitLogOptions): Promise<GitCommit[]>;
  /** Commits que tocaram QUALQUER um dos paths (pathspecs git). */
  fileHistory(paths: string[]): Promise<GitCommit[]>;
  /** Nº de commits em <sha>..HEAD, opcionalmente limitado a paths. */
  countCommitsSince(sha: string, paths?: string[]): Promise<number>;
  /** Commit mais recente que tocou algum dos paths, ou null. */
  lastCommitTouching(paths: string[]): Promise<GitCommit | null>;
  /** Primeiro commit (mais antigo) que ADICIONOU algum dos paths, ou null. */
  firstCommitAdding(paths: string[]): Promise<GitCommit | null>;
}

// Separadores de controle: %x1e entre registros, %x1f entre campos, %x02 encerra
// a parte formatada (o restante, se houver --name-only, é a lista de arquivos).
const REC = "\x1e";
const FS = "\x1f";
const END = "\x02";
const FORMAT = `${REC}%H${FS}%an${FS}%ae${FS}%at${FS}%P${FS}%s${FS}%b${END}`;

function parseTrailers(body: string): Record<string, string[]> {
  const trailers: Record<string, string[]> = {};
  for (const line of body.split("\n")) {
    const m = /^([A-Za-z][A-Za-z-]*):\s+(.+)$/.exec(line.trim());
    if (!m) continue;
    const key = m[1]!.toLowerCase();
    (trailers[key] ??= []).push(m[2]!.trim());
  }
  return trailers;
}

function parseLog(raw: string): GitCommit[] {
  const commits: GitCommit[] = [];
  for (const record of raw.split(REC)) {
    if (!record.trim()) continue;
    const [meta, filesRaw = ""] = record.split(END);
    const fields = meta!.split(FS);
    if (fields.length < 7) continue;
    const [sha, authorName, authorEmail, at, parentsRaw, subject, body] = fields as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const parents = parentsRaw.trim() ? parentsRaw.trim().split(/\s+/) : [];
    const files = filesRaw
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    commits.push({
      sha,
      authorName,
      authorEmail,
      committedAt: Number(at) || 0,
      subject,
      body,
      trailers: parseTrailers(body),
      files,
      isMerge: parents.length > 1,
      parents,
    });
  }
  return commits;
}

class GitReader implements GitInfo {
  constructor(
    private readonly git: SimpleGit,
    public readonly isRepo: boolean,
    public readonly isShallow: boolean,
    public readonly commitCount: number,
    public readonly branch: string,
    public readonly repoName: string,
  ) {}

  async log(opts: GitLogOptions = {}): Promise<GitCommit[]> {
    if (!this.isRepo || this.commitCount === 0) return [];
    const args = ["log", `--pretty=format:${FORMAT}`];
    if (opts.maxCount != null) args.push(`--max-count=${opts.maxCount}`);
    if (opts.noMerges) args.push("--no-merges");
    if (opts.withFiles) args.push("--name-only");
    const raw = await this.safeRaw(args);
    return parseLog(raw);
  }

  async fileHistory(paths: string[]): Promise<GitCommit[]> {
    if (!this.isRepo || paths.length === 0) return [];
    const raw = await this.safeRaw([
      "log",
      `--pretty=format:${FORMAT}`,
      "--",
      ...paths,
    ]);
    return parseLog(raw);
  }

  async countCommitsSince(sha: string, paths?: string[]): Promise<number> {
    if (!this.isRepo || !sha) return 0;
    const args = ["rev-list", "--count", `${sha}..HEAD`];
    if (paths && paths.length) args.push("--", ...paths);
    const raw = await this.safeRaw(args);
    return Number(raw.trim()) || 0;
  }

  async lastCommitTouching(paths: string[]): Promise<GitCommit | null> {
    if (!this.isRepo || paths.length === 0) return null;
    const raw = await this.safeRaw([
      "log",
      "-1",
      `--pretty=format:${FORMAT}`,
      "--",
      ...paths,
    ]);
    return parseLog(raw)[0] ?? null;
  }

  async firstCommitAdding(paths: string[]): Promise<GitCommit | null> {
    if (!this.isRepo || paths.length === 0) return null;
    const raw = await this.safeRaw([
      "log",
      "--diff-filter=A",
      "--reverse",
      `--pretty=format:${FORMAT}`,
      "--",
      ...paths,
    ]);
    return parseLog(raw)[0] ?? null;
  }

  private async safeRaw(args: string[]): Promise<string> {
    try {
      return await this.git.raw(args);
    } catch {
      // Repositório sem HEAD, paths inexistentes etc. → tratamos como vazio.
      return "";
    }
  }
}

/** Carrega os metadados do repositório e devolve um leitor somente-leitura. */
export async function loadGit(root: string): Promise<GitInfo> {
  const git = simpleGit({ baseDir: root });

  let isRepo = false;
  try {
    isRepo = await git.checkIsRepo();
  } catch {
    isRepo = false;
  }

  if (!isRepo) {
    return new GitReader(git, false, false, 0, "", basename(root));
  }

  const [isShallow, commitCount, branch] = await Promise.all([
    git
      .raw(["rev-parse", "--is-shallow-repository"])
      .then((r) => r.trim() === "true")
      .catch(() => false),
    git
      .raw(["rev-list", "--count", "HEAD"])
      .then((r) => Number(r.trim()) || 0)
      .catch(() => 0),
    git
      .raw(["rev-parse", "--abbrev-ref", "HEAD"])
      .then((r) => r.trim())
      .catch(() => ""),
  ]);

  return new GitReader(git, true, isShallow, commitCount, branch, basename(root));
}

function basename(p: string): string {
  const parts = p.replace(/[/\\]+$/, "").split(/[/\\]/);
  return parts[parts.length - 1] || p;
}
