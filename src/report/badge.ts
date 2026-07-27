import { t } from "../i18n/index.js";
import { formatScore } from "../util/format.js";
import type { MaturityLevel, Score } from "../scoring/types.js";

// Cores por banda (estilo shields flat) — coerentes com as cores do terminal.
const COLOR: Record<MaturityLevel, string> = {
  fe: "#e05d44",
  improviso: "#e05d44",
  instrumentado: "#dfb317",
  regulado: "#97ca00",
  dirigido: "#4c1",
};

// Largura aproximada de um texto (px) na fonte do badge (Verdana 11).
function textWidth(s: string): number {
  return Math.round(s.length * 6.3) + 12;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Gera um badge SVG flat (auto-contido, sem rede) com o score e o nível. O usuário
 * commita o arquivo no repo — resolve a questão §14.3 sem endpoint/serviço.
 */
export function buildBadgeSvg(score: Score): string {
  const label = "harness";
  const value = `${formatScore(score.global)}/4 · ${t(`level.${score.level}`)}`;
  const color = COLOR[score.level];

  const lw = textWidth(label);
  const vw = textWidth(value);
  const total = lw + vw;
  const labelX = (lw / 2) * 10;
  const valueX = (lw + vw / 2) * 10;
  const el = escapeXml(label);
  const ev = escapeXml(value);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${el}: ${ev}">
  <title>${el}: ${ev}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="20" fill="#555"/>
    <rect x="${lw}" width="${vw}" height="20" fill="${color}"/>
    <rect width="${total}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110" text-rendering="geometricPrecision">
    <text x="${labelX}" y="150" transform="scale(.1)" fill="#010101" fill-opacity=".3" textLength="${(lw - 12) * 10}">${el}</text>
    <text x="${labelX}" y="140" transform="scale(.1)" textLength="${(lw - 12) * 10}">${el}</text>
    <text x="${valueX}" y="150" transform="scale(.1)" fill="#010101" fill-opacity=".3" textLength="${(vw - 12) * 10}">${ev}</text>
    <text x="${valueX}" y="140" transform="scale(.1)" textLength="${(vw - 12) * 10}">${ev}</text>
  </g>
</svg>
`;
}

export const BADGE_FILENAME = "harness-badge.svg";
