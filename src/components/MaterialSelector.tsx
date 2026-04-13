'use client';

import { useState } from 'react';
import { MATERIALS } from '@/lib/materials';
import type { Material, FilmVariant } from '@/lib/types';

interface MaterialSelectorProps {
  onSelect: (material: Material, variant: FilmVariant) => void;
}

export default function MaterialSelector({ onSelect }: MaterialSelectorProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );

  // Materiales visibles (excluir espejado-exterior, se usa solo para DVH)
  const visibleMaterials = MATERIALS.filter((m) => m.category !== 'espejado-exterior');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">
          Seleccioná el tipo de film
        </h2>
        <p className="text-sm text-muted">
          Elegí el material que necesitás para tus vidrios
        </p>
      </div>

      {/* Material cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleMaterials.map((material) => {
          const isSelected = selectedMaterial?.id === material.id;
          const minPrice = Math.min(...material.variants.map((v) => v.pricePerLinearMeter));

          return (
            <button
              key={material.id}
              onClick={() => setSelectedMaterial(material)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-accent bg-accent/5 shadow-sm'
                  : 'border-border bg-surface hover:border-accent/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{material.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{material.name}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">
                    {material.description}
                  </p>
                  <p className="text-xs text-accent font-medium mt-2">
                    Desde ${minPrice.toLocaleString('es-AR')}/m lineal
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Variant selection */}
      {selectedMaterial && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-sm font-semibold">
            Elegí la variante de {selectedMaterial.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedMaterial.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSelect(selectedMaterial, variant)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface text-left hover:border-accent hover:text-accent transition-colors"
              >
                <span className="text-sm font-medium block">{variant.label}</span>
                <span className="text-xs text-muted">
                  ${variant.pricePerLinearMeter.toLocaleString('es-AR')}/m
                  {variant.bobinWidthCm !== 152 && ` · ${variant.bobinWidthCm}cm ancho`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
