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

  const totalLength = shelves.reduce((sum, s) => sum + s.height, 0);

  return { shelves, totalLength };
}

/**
 * Genera múltiples ordenamientos y elige el mejor resultado.
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
    (a, b) =>
      Math.max(b.width, b.height) - Math.max(a.width, a.height),
    // Mayor altura primero
    (a, b) => Math.max(b.height, b.width) - Math.max(a.height, a.width),
    // Mayor ancho primero
    (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height),
    // Menor área primero (a veces encaja mejor los chicos antes)
    (a, b) => a.width * a.height - b.width * b.height,
  ];

  let bestResult: { placedPieces: PlacedPiece[]; totalLengthCm: number } = {
    placedPieces: [],
    totalLengthCm: Infinity,
  };

  for (const strategy of strategies) {
    const sorted = [...pieces].sort(strategy);
    const { shelves, totalLength } = shelfPack(sorted, bobinWidth);

    if (totalLength < bestResult.totalLengthCm) {
      const allPieces = shelves.flatMap((s) => s.pieces);
      bestResult = { placedPieces: allPieces, totalLengthCm: totalLength };
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
