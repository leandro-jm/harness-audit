import type { FileIndex } from "./file-index.js";

/** Recorte útil do package.json da raiz do repositório auditado. */
export interface PackageJsonInfo {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  packageManager?: string;
  /** true se declara workspaces (array ou objeto), para aviso de monorepo. */
  hasWorkspaces: boolean;
  /** Nomes de todas as deps (deps + devDeps), para detecção de ferramentas. */
  allDepNames: string[];
}

export function loadPackageJson(files: FileIndex): PackageJsonInfo | undefined {
  const raw = files.read("package.json");
  if (raw == null) return undefined;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return undefined;
  }
  const scripts = asStringRecord(parsed.scripts);
  const dependencies = asStringRecord(parsed.dependencies);
  const devDependencies = asStringRecord(parsed.devDependencies);
  return {
    scripts,
    dependencies,
    devDependencies,
    packageManager: typeof parsed.packageManager === "string" ? parsed.packageManager : undefined,
    hasWorkspaces: parsed.workspaces != null,
    allDepNames: [...Object.keys(dependencies), ...Object.keys(devDependencies)],
  };
}

function asStringRecord(v: unknown): Record<string, string> {
  if (v == null || typeof v !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "string") out[k] = val;
  }
  return out;
}
