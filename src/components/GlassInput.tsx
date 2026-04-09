'use client';

import type { GlassInput as GlassInputType } from '@/lib/types';

interface GlassInputProps {
  glasses: GlassInputType[];
  onUpdate: (glasses: GlassInputType[]) => void;
  onSubmit: () => void;
  onBack: () => void;
  materialName: string;
  variantName: string;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function createEmptyGlass(): GlassInputType {
  return {
    id: generateId(),
    widthCm: 0,
    heightCm: 0,
    quantity: 1,
    isDVH: false,
  };
}

export default function GlassInput({
  glasses,
  onUpdate,
  onSubmit,
  onBack,
  materialName,
  variantName,
}: GlassInputProps) {
  const addGlass = () => {
    onUpdate([...glasses, createEmptyGlass()]);
  };

  const removeGlass = (id: string) => {
    if (glasses.length <= 1) return;
    onUpdate(glasses.filter((g) => g.id !== id));
  };

  const updateGlass = (
    id: string,
    field: keyof GlassInputType,
    value: number | boolean
  ) => {
    onUpdate(
      glasses.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const totalPieces = glasses.reduce((sum, g) => sum + g.quantity, 0);
  const hasDVH = glasses.some((g) => g.isDVH);
  const isValid = glasses.every(
    (g) => g.widthCm > 0 && g.heightCm > 0 && g.quantity > 0
  );

  if (glasses.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">
          Ingresá las medidas de tus vidrios
        </h2>
        <p className="text-sm text-muted">
          Material: {materialName} — {variantName}
        </p>
      </div>

      {/* Glass list */}
      <div className="space-y-3">
        {glasses.map((glass, index) => (
          <div
            key={glass.id}
            className="p-4 rounded-xl border border-border bg-surface"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-muted">
                Vidrio {index + 1}
              </span>
              {glasses.length > 1 && (
                <button
                  onClick={() => removeGlass(glass.id)}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">
                  Ancho (cm)
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="ej: 80"
                  value={glass.widthCm || ''}
                  onChange={(e) =>
                    updateGlass(
                      glass.id,
                      'widthCm',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">
                  Alto (cm)
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="ej: 150"
                  value={glass.heightCm || ''}
                  onChange={(e) =>
                    updateGlass(
                      glass.id,
                      'heightCm',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min={1}
                  value={glass.quantity}
                  onChange={(e) =>
                    updateGlass(
                      glass.id,
                      'quantity',
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={glass.isDVH}
                onChange={(e) =>
                  updateGlass(glass.id, 'isDVH', e.target.checked)
                }
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent/40"
              />
              <span className="text-xs text-muted">
                Es vidrio DVH (doble vidriado hermético)
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* DVH warning */}
      {hasDVH && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          Los vidrios DVH requieren instalación por el lado exterior con
          material especial. Se cotizarán por separado con film de seguridad
          exterior.
        </div>
      )}

      {/* Add button */}
      <button
        onClick={addGlass}
        className="w-full py-2.5 rounded-lg border-2 border-dashed border-border text-sm text-muted font-medium hover:border-accent hover:text-accent transition-colors"
      >
        + Agregar otro vidrio
      </button>

      {/* Summary & actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          &larr; Cambiar material
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted">
            {totalPieces} {totalPieces === 1 ? 'vidrio' : 'vidrios'} cargados
          </span>
          <button
            onClick={onSubmit}
            disabled={!isValid}
            className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Calcular corte
          </button>
        </div>
      </div>
    </div>
  );
}
