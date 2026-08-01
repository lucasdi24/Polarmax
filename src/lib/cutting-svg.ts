import type { CuttingResult } from './types';

// ============================================================
// Render del plano de corte a SVG — función pura, sin dependencias.
//
// La usan tanto el componente React (para mostrarlo en la web) como
// /api/plano (para servirlo como imagen a un agente). Un solo dibujo:
// si cambia acá, cambia en los dos lados.
// ============================================================

const PIECE_COLORS = [
  '#2d6a2d', '#4caf50', '#1b5e20', '#66bb6a',
  '#388e3c', '#81c784', '#43a047', '#a5d6a7',
  '#2e7d32', '#c8e6c9', '#1a3a1a', '#4caf50',
];

// Geist va primero porque es la única fuente que se le carga a resvg al
// rasterizar el PNG: si no matchea por nombre, el texto sale en blanco.
// En un browser Geist no existe y cae al resto del stack, que es lo que
// se ve en la web.
const FONT_STACK =
  "Geist, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const BASE_WIDTH = 700;
const PADDING = 50;

/** Alto reservado para el título cuando el SVG va suelto (fuera de la web). */
const TITLE_HEIGHT = 34;

export interface RenderPlanOptions {
  /** Título del plano. En modo standalone se dibuja adentro del SVG. */
  label?: string;
  /**
   * true  → documento SVG completo: xmlns, fondo blanco y título embebido.
   *         Es lo que sirve /api/plano.
   * false → pensado para incrustar en la web, donde el fondo y el título
   *         los pone el markup de alrededor.
   */
  standalone?: boolean;
}

/** Escapa texto para que sea seguro dentro de un nodo XML. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Recorta decimales de sobra: las coordenadas no necesitan más de 2. */
function n(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/**
 * Dibuja el plano de corte de un CuttingResult y devuelve el SVG como string.
 */
export function renderCuttingPlanSVG(
  result: CuttingResult,
  options: RenderPlanOptions = {}
): string {
  const { label, standalone = false } = options;
  const { placedPieces, bobinWidthCm, totalLengthCm } = result;

  // Sin bobina no hay nada que dibujar (evita dividir por cero).
  const safeBobin = bobinWidthCm > 0 ? bobinWidthCm : 1;
  const scale = (BASE_WIDTH - PADDING * 2) / safeBobin;

  const planWidth = safeBobin * scale;
  const planHeight = totalLengthCm * scale;

  const showTitle = standalone && Boolean(label);
  const topOffset = showTitle ? TITLE_HEIGHT : 0;

  const svgWidth = BASE_WIDTH;
  const svgHeight = planHeight + PADDING * 2 + 20 + topOffset;

  const parts: string[] = [];

  // Fondo blanco: en la web lo pone el contenedor, en la imagen suelta no
  // hay contenedor, y un PNG sin fondo se ve negro en cualquier chat.
  if (standalone) {
    parts.push(
      `<rect x="0" y="0" width="${n(svgWidth)}" height="${n(svgHeight)}" fill="#ffffff"/>`
    );
  }

  if (showTitle) {
    parts.push(
      `<text x="${n(PADDING)}" y="24" font-size="14" font-weight="700" fill="#111827">${escapeXml(label!)}</text>`
    );
  }

  // Todo el plano va desplazado hacia abajo si hay título.
  parts.push(`<g transform="translate(0, ${n(topOffset)})">`);

  // Fondo de la bobina
  parts.push(
    `<rect x="${n(PADDING)}" y="${n(PADDING)}" width="${n(planWidth)}" height="${n(planHeight)}" fill="#f8faf8" stroke="#d1d5db" stroke-width="1" rx="4"/>`
  );

  // Guías cada 50 cm
  const gridLines = Math.ceil(totalLengthCm / 50);
  for (let i = 0; i < gridLines; i++) {
    const y = PADDING + i * 50 * scale;
    parts.push(
      `<line x1="${n(PADDING)}" y1="${n(y)}" x2="${n(PADDING + planWidth)}" y2="${n(y)}" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="4 4"/>`
    );
  }

  // Piezas
  placedPieces.forEach((piece, i) => {
    const color = PIECE_COLORS[i % PIECE_COLORS.length];
    const px = PADDING + piece.x * scale;
    const py = PADDING + piece.y * scale;
    const pw = piece.width * scale;
    const ph = piece.height * scale;
    const showFull = pw > 55 && ph > 28;
    const showSmall = pw > 28 && ph > 18;
    const cx = px + pw / 2;
    const cy = py + ph / 2;

    parts.push(
      `<rect x="${n(px)}" y="${n(py)}" width="${n(pw)}" height="${n(ph)}" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="1.5" rx="3"/>`
    );

    if (showFull) {
      // "rot" en vez de una flecha ↻: Geist no trae ese glifo y en el PNG
      // salía un cuadradito, que en un plano de corte se lee como error.
      const medidas = `${piece.originalWidth}x${piece.originalHeight}${piece.rotated ? ' rot' : ''}`;
      parts.push(
        `<text x="${n(cx)}" y="${n(cy - 7)}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="${color}">V${piece.id + 1}</text>`,
        `<text x="${n(cx)}" y="${n(cy + 8)}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#6b7280">${escapeXml(medidas)}</text>`
      );
    } else if (showSmall) {
      parts.push(
        `<text x="${n(cx)}" y="${n(cy)}" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="700" fill="${color}">V${piece.id + 1}</text>`
      );
    }
  });

  // Cota del ancho de bobina
  parts.push(
    `<text x="${n(PADDING + planWidth / 2)}" y="${n(PADDING - 18)}" text-anchor="middle" font-size="11" font-weight="600" fill="#374151">${n(bobinWidthCm)} cm</text>`,
    `<line x1="${n(PADDING)}" y1="${n(PADDING - 8)}" x2="${n(PADDING + planWidth)}" y2="${n(PADDING - 8)}" stroke="#9ca3af" stroke-width="1"/>`,
    `<line x1="${n(PADDING)}" y1="${n(PADDING - 12)}" x2="${n(PADDING)}" y2="${n(PADDING - 4)}" stroke="#9ca3af" stroke-width="1"/>`,
    `<line x1="${n(PADDING + planWidth)}" y1="${n(PADDING - 12)}" x2="${n(PADDING + planWidth)}" y2="${n(PADDING - 4)}" stroke="#9ca3af" stroke-width="1"/>`
  );

  // Cota del largo total
  const midY = PADDING + planHeight / 2;
  const labelX = PADDING - 22;
  parts.push(
    `<text x="${n(labelX)}" y="${n(midY)}" text-anchor="middle" font-size="11" font-weight="600" fill="#374151" transform="rotate(-90, ${n(labelX)}, ${n(midY)})">${(totalLengthCm / 100).toFixed(2)} m</text>`,
    `<line x1="${n(PADDING - 10)}" y1="${n(PADDING)}" x2="${n(PADDING - 10)}" y2="${n(PADDING + planHeight)}" stroke="#9ca3af" stroke-width="1"/>`,
    `<line x1="${n(PADDING - 14)}" y1="${n(PADDING)}" x2="${n(PADDING - 6)}" y2="${n(PADDING)}" stroke="#9ca3af" stroke-width="1"/>`,
    `<line x1="${n(PADDING - 14)}" y1="${n(PADDING + planHeight)}" x2="${n(PADDING - 6)}" y2="${n(PADDING + planHeight)}" stroke="#9ca3af" stroke-width="1"/>`
  );

  parts.push('</g>');

  const xmlns = standalone ? ' xmlns="http://www.w3.org/2000/svg"' : '';
  const sizing = standalone
    ? ` width="${n(svgWidth)}" height="${n(svgHeight)}"`
    : ' class="block w-full h-auto" preserveAspectRatio="xMidYMin meet"';

  return (
    `<svg${xmlns} viewBox="0 0 ${n(svgWidth)} ${n(svgHeight)}"${sizing} font-family="${FONT_STACK}">` +
    parts.join('') +
    `</svg>`
  );
}
