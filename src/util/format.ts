/** Formata um número 0..4 com 1 casa decimal e vírgula (pt-BR): 2.3 → "2,3". */
export function formatScore(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

/** Formata uma porcentagem inteira: 78 → "78%". */
export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

/** Duração em ms → "0,4s" / "1,2s" (pt-BR). */
export function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1).replace(".", ",")}s`;
}

/** Data/hora em pt-BR: "14/07/2026 15:30" (sem depender de Intl locale). */
export function formatDateTimePtBR(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${p(date.getHours())}:${p(date.getMinutes())}`
  );
}

/**
 * Barra de progresso textual de `width` blocos preenchidos proporcionalmente a
 * value/max. Usa █ (cheio) e ░ (vazio) — legível sem depender de cor (a11y).
 */
export function bar(value: number, max: number, width = 10): string {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const filled = Math.round(ratio * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}
