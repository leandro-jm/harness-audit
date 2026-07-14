import type { FileIndex } from "./file-index.js";
import type { PackageJsonInfo } from "./package-json.js";

export type Language = "ts" | "js" | "python" | "go" | "unknown";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "unknown";

export interface StackInfo {
  languages: Language[];
  primary: Language;
  packageManager: PackageManager;
  /** v0.1: só js/ts têm cobertura completa. Demais degradam com aviso. */
  supported: boolean;
}

export function detectStack(files: FileIndex, pkg: PackageJsonInfo | undefined): StackInfo {
  const languages: Language[] = [];

  const hasPkg = files.exists("package.json");
  const hasTsConfig = files.exists(["tsconfig.json", "tsconfig.*.json"]);
  const hasTsFiles = files.exists(["**/*.ts", "**/*.tsx"]);
  const hasJsFiles = files.exists(["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"]);
  const hasPython = files.exists(["pyproject.toml", "requirements.txt", "setup.py", "**/*.py"]);
  const hasGo = files.exists(["go.mod", "**/*.go"]);

  if (hasTsConfig || hasTsFiles) languages.push("ts");
  if (hasPkg || hasJsFiles) languages.push("js");
  if (hasPython) languages.push("python");
  if (hasGo) languages.push("go");

  let primary: Language = "unknown";
  if (hasTsConfig || hasTsFiles) primary = "ts";
  else if (hasPkg || hasJsFiles) primary = "js";
  else if (hasGo) primary = "go";
  else if (hasPython) primary = "python";

  const packageManager = detectPackageManager(files, pkg);
  const supported = primary === "ts" || primary === "js";

  return {
    languages: languages.length ? languages : ["unknown"],
    primary,
    packageManager,
    supported,
  };
}

function detectPackageManager(
  files: FileIndex,
  pkg: PackageJsonInfo | undefined,
): PackageManager {
  const declared = pkg?.packageManager;
  if (declared) {
    if (declared.startsWith("pnpm")) return "pnpm";
    if (declared.startsWith("yarn")) return "yarn";
    if (declared.startsWith("bun")) return "bun";
    if (declared.startsWith("npm")) return "npm";
  }
  if (files.exists("pnpm-lock.yaml")) return "pnpm";
  if (files.exists("yarn.lock")) return "yarn";
  if (files.exists(["bun.lockb", "bun.lock"])) return "bun";
  if (files.exists("package-lock.json")) return "npm";
  return "unknown";
}
