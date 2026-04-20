import type {
  GlassInput,
  CuttingPiece,
  PlacedPiece,
  CuttingResult,
  CuttingError,
} from './types';
import { CUTTING_MARGIN_CM } from './materials';

// ============================================================
// Strip Packing 2D — Optimización de corte con rotación
// ============================================================

/**
 * Expande los GlassInput (con quantity) en piezas individuales con margen.
 */
function expandPieces(glasses: GlassInput[]): CuttingPiece[] {
  const pieces: CuttingPiece[] = [];
  let globalId = 0;

  for (const glass of glasses) {
    for (let i = 0; i < glass.quantity; i++) {
      pieces.push({
        id: globalId++,
        glassId: glass.id,
        originalWidth: glass.widthCm,
        originalHeight: glass.heightCm,
        width: glass.widthCm + CUTTING_MARGIN_CM,
        height: glass.heightCm + CUTTING_MARGIN_CM,
      });
    }
  }

  return pieces;
}

/**
 * Valida que cada pieza pueda caber en la bobina (al menos una dimensión <= ancho bobina).
 */
function validatePieces(
  pieces: CuttingPiece[],
  bobinWidth: number
): CuttingError[] {
  const errors: CuttingError[] = [];

  for (const piece of pieces) {
    if (piece.width > bobinWidth && piece.height > bobinWidth) {
      errors.push({
        glassId: piece.glassId,
        message: `El vidrio de ${piece.originalWidth}cm x ${piece.originalHeight}cm excede el ancho máximo de la bobina (${bobinWidth / 100}m). Contactanos para una solución especial.`,
      });
    }
  }

  return errors;
}

// ------ Shelf-based packing ------

interface Shelf {
  y: number; // posición Y donde empieza el estante
  height: number; // altura del estante (la pieza más alta)
  usedWidth: number; // ancho acumulado usado
  pieces: PlacedPiece[];
}

/**
 * Intenta colocar una pieza en un estante existente.
 * Devuelve true si pudo.
 */
function tryPlaceOnShelf(
  shelf: Shelf,
  piece: CuttingPiece,
  bobinWidth: number,
  preferRotated: boolean
): PlacedPiece | null {
  // Determinar orientaciones a probar
  const orientations: Array<{ w: number; h: number; rotated: boolean }> = [];

  const canFitNormal =
    piece.width <= bobinWidth && piece.height <= bobinWidth;
  const canFitRotated =
    piece.height <= bobinWidth && piece.width <= bobinWidth;

  if (preferRotated) {
    if (canFitRotated)
      orientations.push({ w: piece.height, h: piece.width, rotated: true });
    if (canFitNormal)
      orientations.push({ w: piece.width, h: piece.height, rotated: false });
  } else {
    if (canFitNormal)
      orientations.push({ w: piece.width, h: piece.height, rotated: false });
    if (canFitRotated)
      orientations.push({ w: piece.height, h: piece.width, rotated: true });
  }

  // Si una dimensión no cabe en el ancho, forzar la que sí cabe
  if (piece.width > bobinWidth && piece.height <= bobinWidth) {
    return tryFit(shelf, piece, piece.height, piece.width, true, bobinWidth);
  }
  if (piece.height > bobinWidth && piece.width <= bobinWidth) {
    return tryFit(shelf, piece, piece.width, piece.height, false, bobinWidth);
  }

  for (const { w, h, rotated } of orientations) {
    const result = tryFit(shelf, piece, w, h, rotated, bobinWidth);
    if (result) return result;
  }

  return null;
}

function tryFit(
  shelf: Shelf,
  piece: CuttingPiece,
  w: number,
  h: number,
  rotated: boolean,
  bobinWidth: number
): PlacedPiece | null {
  if (shelf.usedWidth + w > bobinWidth) return null;
  // Pieza cabe si su altura no excede demasiado (para estante nuevo, será la primera)
  // En estantes existentes, siempre cabe en altura (la shelf crece si es necesario)

  return {
    id: piece.id,
    glassId: piece.glassId,
    x: shelf.usedWidth,
    y: shelf.y,
    width: w,
    height: h,
    rotated,
    originalWidth: piece.originalWidth,
    originalHeight: piece.originalHeight,
  };
}

/**
 * Ejecuta shelf packing con un ordenamiento dado de piezas.
 */
function shelfPack(
  pieces: CuttingPiece[],
  bobinWidth: number
): { shelves: Shelf[]; totalLength: number } {
  const shelves: Shelf[] = [];

  for (const piece of pieces) {
    let placed = false;

    // Intentar colocar en estantes existentes
    for (const shelf of shelves) {
      // Probar ambas orientaciones, preferir la que minimice desperdicio vertical
      const normalH =
        piece.width <= bobinWidth ? piece.height : piece.width;
      const rotatedH =
        piece.height <= bobinWidth ? piece.width : piece.height;

      // Preferir rotación si la pieza encaja mejor en la altura del shelf
      const preferRotated =
        Math.abs(rotatedH - shelf.height) < Math.abs(normalH - shelf.height);

      const placedPiece = tryPlaceOnShelf(
        shelf,
        piece,
        bobinWidth,
        preferRotated
      );

      if (placedPiece) {
        shelf.pieces.push(placedPiece);
        shelf.usedWidth += placedPiece.width;
        shelf.height = Math.max(shelf.height, placedPiece.height);
        placed = true;
        break;
      }
    }

    // Si no cabe en ningún estante, crear uno nuevo
    if (!placed) {
      const currentY = shelves.reduce((sum, s) => sum + s.height, 0);

      // Decidir orientación para nuevo estante
      let w: number, h: number, rotated: boolean;

      if (piece.width > bobinWidth) {
        // Forzar rotación: poner la dimensión menor en el ancho
        w = piece.height;
        h = piece.width;
        rotated = true;
      } else if (piece.height > bobinWidth) {
        w = piece.width;
        h = piece.height;
        rotated = false;
      } else {
        // Ambas orientaciones posibles: elegir la que use menos altura
        if (piece.height <= piece.width) {
          // Rotar para que la dimensión menor sea la altura del shelf
          w = piece.height;
          h = piece.width;
          rotated = true;
        } else {
          w = piece.width;
          h = piece.height;
          rotated = false;
        }
      }

      const newShelf: Shelf = {
        y: currentY,
        height: h,
        usedWidth: w,
        pieces: [
          {
            id: piece.id,
            glassId: piece.glassId,
            x: 0,
            y: currentY,
            width: w,
            height: h,
            rotated,
            originalWidth: piece.originalWidth,
            originalHeight: piece.originalHeight,
          },
        ],
      };

      shelves.push(newShelf);
    }
  }

  // Post-optimization: rotar piezas únicas en shelves donde rotar reduce la altura del shelf.
  // Caso típico: shelf con 1 sola pieza alta — rotarla baja la altura del shelf
  // sin afectar al resto (siempre que la rotación quepa en el ancho de bobina).
  for (const shelf of shelves) {
    if (shelf.pieces.length !== 1) continue;
    const piece = shelf.pieces[0];
    // Probar rotar la pieza
    const rotatedW = piece.height;
    const rotatedH = piece.width;
    // Solo rotar si cabe en el ancho de bobina Y reduce la altura del shelf
    if (rotatedW <= bobinWidth && rotatedH < piece.height) {
      piece.width = rotatedW;
      piece.height = rotatedH;
      piece.rotated = !piece.rotated;
      shelf.usedWidth = rotatedW;
      shelf.height = rotatedH;
    }
  }

  // Recalcular posiciones Y después de la post-optimización
  let currentY = 0;
  for (const shelf of shelves) {
    shelf.y = currentY;
    for (const p of shelf.pieces) {
      p.y = currentY;
    }
    currentY += shelf.height;
  }

  const totalLength = shelves.reduce((sum, s) => sum + s.height, 0);

  return { shelves, totalLength };
}

// ============================================================
// Maximal Rectangles — mejor para piezas mixtas (aprovecha huecos)
// ============================================================

interface FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const HUGE_HEIGHT = 100000; // "infinito" para el largo de bobina

type RotationPref = 'auto' | 'keep' | 'rotate';

/**
 * Algoritmo Maximal Rectangles con Best Short Side Fit (BSSF).
 * Mantiene una lista de rectángulos libres y, para cada pieza,
 * busca el mejor espacio considerando ambas orientaciones.
 *
 * @param rotationPref 'auto' usa BSSF, 'keep' prefiere no rotar, 'rotate' prefiere rotar
 */
function maximalRectPack(
  pieces: CuttingPiece[],
  bobinWidth: number,
  rotationPref: RotationPref = 'auto'
): { placedPieces: PlacedPiece[]; totalLength: number } {
  const placed: PlacedPiece[] = [];
  let freeRects: FreeRect[] = [
    { x: 0, y: 0, width: bobinWidth, height: HUGE_HEIGHT },
  ];
  let maxY = 0;

  for (const piece of pieces) {
    // Buscar el mejor rectángulo libre para esta pieza
    let best: {
      rect: FreeRect;
      w: number;
      h: number;
      rotated: boolean;
      score: number;
    } | null = null;

    const tryFit = (w: number, h: number, rotated: boolean) => {
      for (const rect of freeRects) {
        if (w > rect.width || h > rect.height) continue;
        // Best Short Side Fit: minimizar la menor distancia sobrante
        const shortSideLeft = Math.min(rect.width - w, rect.height - h);
        const longSideLeft = Math.max(rect.width - w, rect.height - h);
        // Tiebreaker: preferir y más bajo (arriba)
        let score = shortSideLeft * 1e6 + longSideLeft + rect.y * 0.001;
        // Ajuste según preferencia de rotación
        if (rotationPref === 'keep' && rotated) score += 1e12;
        if (rotationPref === 'rotate' && !rotated) score += 1e12;
        if (!best || score < best.score) {
          best = { rect, w, h, rotated, score };
        }
      }
    };

    // Orientación normal
    tryFit(piece.width, piece.height, false);
    // Orientación rotada
    if (piece.width !== piece.height) {
      tryFit(piece.height, piece.width, true);
    }

    if (!best) continue; // Pieza no cabe (no debería pasar con altura "infinita")

    // Placeholder: narrow type because TS can't infer 'best' is non-null after 'continue'
    const chosen: {
      rect: FreeRect;
      w: number;
      h: number;
      rotated: boolean;
      score: number;
    } = best;

    // Colocar la pieza en la esquina superior-izquierda del rect elegido
    const placedPiece: PlacedPiece = {
      id: piece.id,
      glassId: piece.glassId,
      x: chosen.rect.x,
      y: chosen.rect.y,
      width: chosen.w,
      height: chosen.h,
      rotated: chosen.rotated,
      originalWidth: piece.originalWidth,
      originalHeight: piece.originalHeight,
    };
    placed.push(placedPiece);
    maxY = Math.max(maxY, placedPiece.y + placedPiece.height);

    // Actualizar rectángulos libres: romper los que se superponen con la pieza colocada
    const px = placedPiece.x;
    const py = placedPiece.y;
    const pw = placedPiece.width;
    const ph = placedPiece.height;

    const newFreeRects: FreeRect[] = [];
    for (const rect of freeRects) {
      // Si no hay intersección, mantener intacto
      if (
        rect.x >= px + pw ||
        rect.x + rect.width <= px ||
        rect.y >= py + ph ||
        rect.y + rect.height <= py
      ) {
        newFreeRects.push(rect);
        continue;
      }
      // Dividir en hasta 4 sub-rects (izquierda, derecha, arriba, abajo de la pieza)
      if (px > rect.x) {
        newFreeRects.push({
          x: rect.x,
          y: rect.y,
          width: px - rect.x,
          height: rect.height,
        });
      }
      if (px + pw < rect.x + rect.width) {
        newFreeRects.push({
          x: px + pw,
          y: rect.y,
          width: rect.x + rect.width - (px + pw),
          height: rect.height,
        });
      }
      if (py > rect.y) {
        newFreeRects.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: py - rect.y,
        });
      }
      if (py + ph < rect.y + rect.height) {
        newFreeRects.push({
          x: rect.x,
          y: py + ph,
          width: rect.width,
          height: rect.y + rect.height - (py + ph),
        });
      }
    }

    // Eliminar rectángulos que están contenidos en otros (duplicados/redundantes)
    freeRects = newFreeRects.filter((r, i) => {
      if (r.width <= 0 || r.height <= 0) return false;
      return !newFreeRects.some(
        (other, j) =>
          i !== j &&
          other.x <= r.x &&
          other.y <= r.y &&
          other.x + other.width >= r.x + r.width &&
          other.y + other.height >= r.y + r.height
      );
    });
  }

  return { placedPieces: placed, totalLength: maxY };
}

/**
 * Packing Maximal Rectangles SIN probar rotación (orientación fija).
 * Usado por la fase de brute force para probar distintas combinaciones
 * de orientación sin que el algoritmo decida rotar.
 */
function fixedOrientationPack(
  pieces: CuttingPiece[],
  bobinWidth: number
): { placedPieces: PlacedPiece[]; totalLength: number } {
  const placed: PlacedPiece[] = [];
  let freeRects: FreeRect[] = [
    { x: 0, y: 0, width: bobinWidth, height: HUGE_HEIGHT },
  ];
  let maxY = 0;

  // Ordenar por área descendente para mejor packing
  const sorted = [...pieces].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );

  for (const piece of sorted) {
    let best: { rect: FreeRect; score: number } | null = null;

    for (const rect of freeRects) {
      if (piece.width > rect.width || piece.height > rect.height) continue;
      const shortSideLeft = Math.min(
        rect.width - piece.width,
        rect.height - piece.height
      );
      const longSideLeft = Math.max(
        rect.width - piece.width,
        rect.height - piece.height
      );
      const score = shortSideLeft * 1e6 + longSideLeft + rect.y * 0.001;
      if (!best || score < best.score) {
        best = { rect, score };
      }
    }

    if (!best) continue; // no cabe (no debería)

    const chosen = best;

    const placedPiece: PlacedPiece = {
      id: piece.id,
      glassId: piece.glassId,
      x: chosen.rect.x,
      y: chosen.rect.y,
      width: piece.width,
      height: piece.height,
      rotated: false, // se corrige luego en el caller
      originalWidth: piece.originalWidth,
      originalHeight: piece.originalHeight,
    };
    placed.push(placedPiece);
    maxY = Math.max(maxY, placedPiece.y + placedPiece.height);

    // Actualizar rects libres (misma lógica que maximalRectPack)
    const px = placedPiece.x;
    const py = placedPiece.y;
    const pw = placedPiece.width;
    const ph = placedPiece.height;
    const newFreeRects: FreeRect[] = [];
    for (const rect of freeRects) {
      if (
        rect.x >= px + pw ||
        rect.x + rect.width <= px ||
        rect.y >= py + ph ||
        rect.y + rect.height <= py
      ) {
        newFreeRects.push(rect);
        continue;
      }
      if (px > rect.x)
        newFreeRects.push({
          x: rect.x,
          y: rect.y,
          width: px - rect.x,
          height: rect.height,
        });
      if (px + pw < rect.x + rect.width)
        newFreeRects.push({
          x: px + pw,
          y: rect.y,
          width: rect.x + rect.width - (px + pw),
          height: rect.height,
        });
      if (py > rect.y)
        newFreeRects.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: py - rect.y,
        });
      if (py + ph < rect.y + rect.height)
        newFreeRects.push({
          x: rect.x,
          y: py + ph,
          width: rect.width,
          height: rect.y + rect.height - (py + ph),
        });
    }
    freeRects = newFreeRects.filter((r, i) => {
      if (r.width <= 0 || r.height <= 0) return false;
      return !newFreeRects.some(
        (other, j) =>
          i !== j &&
          other.x <= r.x &&
          other.y <= r.y &&
          other.x + other.width >= r.x + r.width &&
          other.y + other.height >= r.y + r.height
      );
    });
  }

  return { placedPieces: placed, totalLength: maxY };
}

/**
 * Genera múltiples ordenamientos y algoritmos, elige el mejor resultado.
 */
function optimizedPack(
  pieces: CuttingPiece[],
  bobinWidth: number
): { placedPieces: PlacedPiece[]; totalLengthCm: number } {
  type SortStrategy = (a: CuttingPiece, b: CuttingPiece) => number;

  const strategies: SortStrategy[] = [
    // Mayor área primero
    (a, b) => b.width * b.height - a.width * a.height,
    // Mayor dimensión máxima primero
    (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height),
    // Mayor altura primero
    (a, b) => Math.max(b.height, b.width) - Math.max(a.height, a.width),
    // Mayor dimensión mínima primero
    (a, b) => Math.min(b.width, b.height) - Math.min(a.width, a.height),
    // Menor área primero (a veces encaja mejor los chicos antes)
    (a, b) => a.width * a.height - b.width * b.height,
    // Por perímetro (mayor primero)
    (a, b) => 2 * (b.width + b.height) - 2 * (a.width + a.height),
  ];

  let bestResult: { placedPieces: PlacedPiece[]; totalLengthCm: number } = {
    placedPieces: [],
    totalLengthCm: Infinity,
  };

  for (const strategy of strategies) {
    const sorted = [...pieces].sort(strategy);

    // 1) Shelf packing con esta estrategia
    const shelfRes = shelfPack(sorted, bobinWidth);
    if (shelfRes.totalLength < bestResult.totalLengthCm) {
      bestResult = {
        placedPieces: shelfRes.shelves.flatMap((s) => s.pieces),
        totalLengthCm: shelfRes.totalLength,
      };
    }

    // 2) Maximal Rectangles con varias preferencias de rotación
    for (const pref of ['auto', 'keep', 'rotate'] as const) {
      const mrRes = maximalRectPack(sorted, bobinWidth, pref);
      if (mrRes.totalLength < bestResult.totalLengthCm) {
        bestResult = {
          placedPieces: mrRes.placedPieces,
          totalLengthCm: mrRes.totalLength,
        };
      }
    }
  }

  // 3) Brute force de orientaciones para N pequeño (≤ 12 piezas)
  // Garantiza encontrar layouts óptimos en mixes de tamaños.
  if (pieces.length <= 12) {
    const n = pieces.length;
    const combos = 1 << n;
    for (let mask = 0; mask < combos; mask++) {
      const preRotated: CuttingPiece[] = pieces.map((p, i) => {
        const rot = (mask >> i) & 1;
        if (rot) {
          return {
            ...p,
            width: p.height,
            height: p.width,
            // Invertir también dimensiones originales para que al final rotated=!rotated
            originalWidth: p.originalHeight,
            originalHeight: p.originalWidth,
          };
        }
        return p;
      });
      // Probar packing con orientación fija (sin más rotaciones)
      const { placedPieces, totalLength } = fixedOrientationPack(
        preRotated,
        bobinWidth
      );
      if (totalLength < bestResult.totalLengthCm) {
        // Restaurar originalWidth/Height y marcar rotated correctamente
        const restored = placedPieces.map((p, i) => {
          const rot = (mask >> i) & 1;
          if (rot) {
            return {
              ...p,
              originalWidth: p.originalHeight,
              originalHeight: p.originalWidth,
              rotated: true,
            };
          }
          return p;
        });
        bestResult = { placedPieces: restored, totalLengthCm: totalLength };
      }
    }
  }

  return bestResult;
}

// ============================================================
// API Pública
// ============================================================

export interface CuttingInput {
  glasses: GlassInput[];
  bobinWidthCm: number;
}

export interface CuttingOutput {
  results: CuttingResult[];
  errors: CuttingError[];
}

/**
 * Calcula el corte óptimo.
 * Separa vidrios normales de DVH (generan planos de corte independientes).
 */
export function calculateCutting(input: CuttingInput): CuttingOutput {
  const { glasses, bobinWidthCm } = input;

  const normalGlasses = glasses.filter((g) => !g.isDVH);
  const dvhGlasses = glasses.filter((g) => g.isDVH);

  const results: CuttingResult[] = [];
  const allErrors: CuttingError[] = [];

  for (const group of [normalGlasses, dvhGlasses]) {
    if (group.length === 0) continue;

    const pieces = expandPieces(group);
    const errors = validatePieces(pieces, bobinWidthCm);

    if (errors.length > 0) {
      allErrors.push(...errors);
      // Filtrar piezas inválidas y continuar con las válidas
      const validPieces = pieces.filter(
        (p) =>
          !errors.some((e) => e.glassId === p.glassId)
      );
      if (validPieces.length === 0) continue;

      const { placedPieces, totalLengthCm } = optimizedPack(
        validPieces,
        bobinWidthCm
      );

      const totalArea = bobinWidthCm * totalLengthCm;
      const usedArea = placedPieces.reduce(
        (sum, p) => sum + p.width * p.height,
        0
      );
      const wastePercent =
        totalArea > 0 ? ((totalArea - usedArea) / totalArea) * 100 : 0;

      results.push({
        linearMeters: totalLengthCm / 100,
        totalLengthCm,
        placedPieces,
        wastePercent,
        bobinWidthCm,
      });
    } else {
      const { placedPieces, totalLengthCm } = optimizedPack(
        pieces,
        bobinWidthCm
      );

      const totalArea = bobinWidthCm * totalLengthCm;
      const usedArea = placedPieces.reduce(
        (sum, p) => sum + p.width * p.height,
        0
      );
      const wastePercent =
        totalArea > 0 ? ((totalArea - usedArea) / totalArea) * 100 : 0;

      results.push({
        linearMeters: totalLengthCm / 100,
        totalLengthCm,
        placedPieces,
        wastePercent,
        bobinWidthCm,
      });
    }
  }

  return { results, errors: allErrors };
}
