import { createColors } from "picocolors";

// Live binding (ESM): importadores veem a reatribuição feita por setColorEnabled.
// Sempre use `colors.x(...)` — nunca desestruture, senão captura o valor antigo.
export let colors = createColors(false);

/** Liga/desliga cor globalmente (respeita --no-color / NO_COLOR). */
export function setColorEnabled(on: boolean): void {
  colors = createColors(on);
}
