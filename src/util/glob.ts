import picomatch from "picomatch";

/** Cria um matcher em memória para casar caminhos avulsos (ex.: arquivos de um commit). */
export function makeMatcher(patterns: string[]): (path: string) => boolean {
  const isMatch = picomatch(patterns, { dot: true });
  return (path: string) => isMatch(path);
}
