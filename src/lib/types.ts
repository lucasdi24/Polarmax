// ============================================================
// Tipos compartidos — Polarmax Cotizador MVP
// ============================================================

/** Categoría principal de film */
export type FilmCategory =
  | 'seguridad'
  | 'espejado'
  | 'esmerilado'
  | 'polarizado'
  | 'nano-ceramico'
  | 'espejado-exterior';

/** Variante dentro de una categoría — cada una con su precio y ancho de bobina */
export interface FilmVariant {
  id: string;
  label: string;
  bobinWidthCm: number;
  pricePerLinearMeter: number;
}

/** Definición completa de un material */
export interface Material {
  id: string;
  category: FilmCategory;
  name: string;
  description: string;
  variants: FilmVariant[];
  icon: string;
}

/** Vidrio ingresado por el usuario */
export interface GlassInput {
  id: string;
  widthCm: number;
  heightCm: number;
  quantity: number;
  isDVH: boolean;
}

/** Pieza expandida (una por cada unidad, ya con margen) */
export interface CuttingPiece {
  id: number; // índice global
  glassId: string; // referencia al GlassInput
  originalWidth: number; // medida original del vidrio
  originalHeight: number;
  width: number; // ancho con margen
  height: number; // alto con margen
}

/** Pieza ya colocada en la bobina */
export interface PlacedPiece {
  id: number;
  glassId: string;
  x: number; // posición X en la bobina (cm)
  y: number; // posición Y en la bobina (cm)
  width: number; // ancho final colocado (con margen, puede estar rotado)
  height: number; // alto final colocado
  rotated: boolean;
  originalWidth: number;
  originalHeight: number;
}

/** Resultado del algoritmo de corte */
export interface CuttingResult {
  linearMeters: number;
  totalLengthCm: number;
  placedPieces: PlacedPiece[];
  wastePercent: number;
  bobinWidthCm: number;
}

/** Error cuando un vidrio no cabe */
export interface CuttingError {
  glassId: string;
  message: string;
}

/** Estado global del cotizador */
export interface QuoterState {
  step: 1 | 2 | 3;
  selectedMaterial: Material | null;
  selectedVariant: FilmVariant | null;
  glasses: GlassInput[];
  result: CuttingResult | null;
  errors: CuttingError[];
}
