'use client';

import { useState } from 'react';
import { MATERIALS } from '@/lib/materials';
import type { Material, FilmVariant } from '@/lib/types';

interface MaterialSelectorProps {
  onSelect: (material: Material, variant: FilmVariant) => void;
}

export default function MaterialSelector({ onSelect }: MaterialSelectorProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const visibleMaterials = MATERIALS.filter((m) => m.category !== 'espejado-exterior');

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Cotizá tu film en segundos
        </h2>
        <p className="text-muted mt-2 text-sm sm:text-base max-w-lg mx-auto">
          Seleccioná el tipo de lámina que necesitás y te calculamos la cantidad
          exacta de material para tus vidrios.
        </p>
      </div>

      {/* Material grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleMaterials.map((material) => {
          const isSelected = selectedMaterial?.id === material.id;
          const minPrice = Math.min(...material.variants.map((v) => v.pricePerLinearMeter));

          return (
            <button
              key={material.id}
              onClick={() => setSelectedMaterial(material)}
              className={`group text-left p-5 rounded-2xl border-2 cursor-pointer ${
                isSelected
                  ? 'border-accent bg-accent-lighter/50 shadow-lg shadow-accent/10'
                  : 'border-border-light bg-surface hover:border-accent/30 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5 grayscale group-hover:grayscale-0" style={isSelected ? { filter: 'none' } : undefined}>
                  {material.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm ${isSelected ? 'text-accent-dark' : 'text-foreground'}`}>
                    {material.name}
                  </h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                    {material.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className={`text-xs font-bold ${isSelected ? 'text-accent' : 'text-accent-light'}`}>
                      Desde ${minPrice.toLocaleString('es-AR')}
                    </span>
                    <span className="text-xs text-muted-light">/m lineal</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Variant selection */}
      {selectedMaterial && (
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">
            Elegí la variante de {selectedMaterial.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedMaterial.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSelect(selectedMaterial, variant)}
                className="group p-3.5 rounded-xl border border-border bg-background text-left hover:border-accent hover:bg-accent-lighter/30 cursor-pointer"
              >
                <span className="text-sm font-semibold text-foreground group-hover:text-accent-dark block">
                  {variant.label}
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-bold text-accent-light">
                    ${variant.pricePerLinearMeter.toLocaleString('es-AR')}/m
                  </span>
                  {variant.bobinWidthCm !== 152 && (
                    <>
                      <span className="text-muted-light">·</span>
                      <span className="text-xs text-muted">
                        bobina {variant.bobinWidthCm}cm
                      </span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
