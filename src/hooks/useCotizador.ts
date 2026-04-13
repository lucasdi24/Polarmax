'use client';

import { useState, useCallback } from 'react';
import type {
  QuoterState,
  Material,
  FilmVariant,
  GlassInput,
  CuttingResult,
  CuttingError,
} from '@/lib/types';
import { calculateCutting } from '@/lib/cutting-algorithm';

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function createEmptyGlass(): GlassInput {
  return { id: generateId(), widthCm: 0, heightCm: 0, quantity: 1, isDVH: false };
}

const initialState: QuoterState = {
  step: 1,
  selectedMaterial: null,
  selectedVariant: null,
  glasses: [createEmptyGlass()],
  result: null,
  errors: [],
};

export function useCotizador() {
  const [state, setState] = useState<QuoterState>(initialState);

  const selectMaterial = useCallback(
    (material: Material, variant: FilmVariant) => {
      setState((prev) => ({
        ...prev,
        step: 2,
        selectedMaterial: material,
        selectedVariant: variant,
        // Mantener vidrios si ya había cargados (por si vuelve atrás)
        glasses: prev.glasses.length > 0 ? prev.glasses : [],
      }));
    },
    []
  );

  const updateGlasses = useCallback((glasses: GlassInput[]) => {
    setState((prev) => ({ ...prev, glasses }));
  }, []);

  const calculate = useCallback(() => {
    if (!state.selectedMaterial || !state.selectedVariant) return;

    const { results, errors } = calculateCutting({
      glasses: state.glasses,
      bobinWidthCm: state.selectedVariant.bobinWidthCm,
    });

    setState((prev) => ({
      ...prev,
      step: 3,
      result: results[0] ?? null,
      errors,
    }));
  }, [state.selectedMaterial, state.selectedVariant, state.glasses]);

  const goToStep = useCallback((step: 1 | 2 | 3) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: 1,
      selectedMaterial: null,
      selectedVariant: null,
      glasses: [createEmptyGlass()],
      result: null,
      errors: [],
    });
  }, []);

  // Obtener todos los results (normal + DVH) recalculando
  const allResults: CuttingResult[] = (() => {
    if (state.step !== 3 || !state.selectedVariant) return [];
    const { results } = calculateCutting({
      glasses: state.glasses,
      bobinWidthCm: state.selectedVariant.bobinWidthCm,
    });
    return results;
  })();

  const hasDVH = state.glasses.some((g) => g.isDVH);

  return {
    state,
    allResults,
    hasDVH,
    selectMaterial,
    updateGlasses,
    calculate,
    goToStep,
    reset,
  };
}
