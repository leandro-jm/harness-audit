import { readFileSync } from "node:fs";
import { join } from "node:path";
import { glob } from "tinyglobby";
import picomatch from "picomatch";

/**
 * Índice de arquivos do repositório, construído com UMA varredura de disco.
 * exists()/find() casam padrões glob em memória (picomatch) sobre a lista `all`,
 * evitando re-varrer o disco a cada check.
 */
export interface FileIndex {
  /** Todos os caminhos relativos rastreados (exclui node_modules, .git, dist…). */
  all: string[];
  /** Nomes de diretórios de primeiro nível (para 2.2 cruzar com o guia). */
  topLevelDirs: string[];
  /** true se ALGUM arquivo casa algum dos padrões. */
  exists(patterns: string | string[]): boolean;
  /** Todos os arquivos que casam algum dos padrões. */
  find(patterns: string | string[]): string[];
  /** Conteúdo do arquivo (relativo à raiz), com cap de tamanho e cache; null se ausente/binário. */
  read(relPath: string): string | null;
}

// Diretórios que nunca interessam à auditoria — reduzem ruído e custo.
const IGNORE = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/.next/**",
  "**/.turbo/**",
  "**/vendor/**",
  "**/.venv/**",
  "**/__pycache__/**",
];

const MAX_READ_BYTES = 512 * 1024; // 512 KB: guias/specs/configs cabem folgado.

class Index implements FileIndex {
  private readonly cache = new Map<string, string | null>();

  constructor(
    private readonly root: string,
    public readonly all: string[],
    public readonly topLevelDirs: string[],
  ) {}

  exists(patterns: string | string[]): boolean {
    const isMatch = picomatch(toArray(patterns), { dot: true });
    return this.all.some((p) => isMatch(p));
  }

  find(patterns: string | string[]): string[] {
    const isMatch = picomatch(toArray(patterns), { dot: true });
    return this.all.filter((p) => isMatch(p));
  }

  read(relPath: string): string | null {
    if (this.cache.has(relPath)) return this.cache.get(relPath)!;
    let content: string | null = null;
    try {
      const buf = readFileSync(join(this.root, relPath));
      if (buf.length <= MAX_READ_BYTES && !looksBinary(buf)) {
        content = buf.toString("utf8");
      }
    } catch {
      content = null;
    }
    this.cache.set(relPath, content);
    return content;
  }
}

function toArray(p: string | string[]): string[] {
  return Array.isArray(p) ? p : [p];
}

function looksBinary(buf: Buffer): boolean {
  // Heurística barata: NUL nos primeiros KB indica binário.
  const n = Math.min(buf.length, 1024);
  for (let i = 0; i < n; i++) if (buf[i] === 0) return true;
  return false;
}

/** Varre o repositório uma vez e devolve o índice de arquivos. */
export async function loadFileIndex(root: string): Promise<FileIndex> {
  const all = await glob("**/*", {
    cwd: root,
    dot: true,
    ignore: IGNORE,
    onlyFiles: true,
    followSymbolicLinks: false,
  });
  all.sort();
  const topLevelDirs = Array.from(
    new Set(
      all
        .map((p) => p.split("/"))
        .filter((parts) => parts.length > 1)
        .map((parts) => parts[0]!),
    ),
  ).sort();
  return new Index(root, all, topLevelDirs);
}
