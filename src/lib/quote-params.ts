import type { GlassInput } from './types';

// ============================================================
// Codificación compacta de una cotización en la query string.
//
// Permite que el plano de corte sea una URL sin estado: no hace falta
// guardar nada en base de datos ni subir la imagen a ningún lado.
// Un agente arma la URL, la manda, y quien la abre ve el plano.
//
// Formato:  ANCHOxALTOxCANTIDAD, separados por coma, sufijo "d" si es DVH.
// Ejemplo:  120x90x2,60x180x1,100x100x1d
// ============================================================

/** Serializa los vidrios al formato compacto de la query string. */
export function encodeGlasses(glasses: GlassInput[]): string {
  return glasses
    .map((g) => `${g.widthCm}x${g.heightCm}x${g.quantity}${g.isDVH ? 'd' : ''}`)
    .join(',');
}

export interface ParsedGlasses {
  glasses: GlassInput[];
  error: string | null;
}

/** Lee el formato compacto. Devuelve error legible en vez de tirar excepción. */
export function parseGlasses(spec: string | null): ParsedGlasses {
  if (!spec || !spec.trim()) {
    return { glasses: [], error: 'Falta el parámetro g (vidrios)' };
  }

  const glasses: GlassInput[] = [];
  const items = spec.split(',');

  for (let i = 0; i < items.length; i++) {
    const raw = items[i].trim();
    if (!raw) continue;

    const isDVH = raw.endsWith('d');
    const body = isDVH ? raw.slice(0, -1) : raw;
    const parts = body.split('x');

    if (parts.length !== 3) {
      return {
        glasses: [],
        error: `Vidrio "${raw}" mal formado. Se espera ANCHOxALTOxCANTIDAD (ej: 120x90x2)`,
      };
    }

    const widthCm = Number(parts[0]);
    const heightCm = Number(parts[1]);
    const quantity = Number(parts[2]);

    if (!Number.isFinite(widthCm) || widthCm <= 0) {
      return { glasses: [], error: `Ancho inválido en "${raw}"` };
    }
    if (!Number.isFinite(heightCm) || heightCm <= 0) {
      return { glasses: [], error: `Alto inválido en "${raw}"` };
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { glasses: [], error: `Cantidad inválida en "${raw}": debe ser un entero > 0` };
    }

    glasses.push({ id: `g${i}`, widthCm, heightCm, quantity, isDVH });
  }

  if (glasses.length === 0) {
    return { glasses: [], error: 'No se pudo leer ningún vidrio' };
  }

  return { glasses, error: null };
}

/** Techo de piezas por cotización: evita que una URL dispare un packing carísimo. */
export const MAX_PIECES = 60;

/** Suma las piezas reales (expandiendo cantidades). */
export function countPieces(glasses: GlassInput[]): number {
  return glasses.reduce((sum, g) => sum + g.quantity, 0);
}
