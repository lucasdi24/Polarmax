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
  return { id: generateId(), widthCm: 0, heightCm: 0, quantity: 1, isDVH: false };
}

export default function GlassInput({
  glasses,
  onUpdate,
  onSubmit,
  onBack,
  materialName,
  variantName,
}: GlassInputProps) {
  const addGlass = () => onUpdate([...glasses, createEmptyGlass()]);

  const removeGlass = (id: string) => {
    if (glasses.length <= 1) return;
    onUpdate(glasses.filter((g) => g.id !== id));
  };

  const updateGlass = (id: string, field: keyof GlassInputType, value: number | boolean) => {
    onUpdate(glasses.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const totalPieces = glasses.reduce((sum, g) => sum + g.quantity, 0);
  const hasDVH = glasses.some((g) => g.isDVH);
  const isValid = glasses.every((g) => g.widthCm > 0 && g.heightCm > 0 && g.quantity > 0);

  if (glasses.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-accent-lighter/50 rounded-2xl p-5 border border-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Medidas de tus vidrios</h2>
            <p className="text-sm text-accent-dark/70 mt-0.5">
              {materialName} — {variantName}
            </p>
          </div>
          <div className="bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {totalPieces} {totalPieces === 1 ? 'vidrio' : 'vidrios'}
          </div>
        </div>
      </div>

      {/* Glass cards */}
      <div className="space-y-3">
        {glasses.map((glass, index) => (
          <div
            key={glass.id}
            className="bg-surface rounded-2xl border border-border p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent-lighter text-accent text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <span className="text-sm font-semibold text-foreground">Vidrio {index + 1}</span>
              </div>
              {glasses.length > 1 && (
                <button
                  onClick={() => removeGlass(glass.id)}
                  className="text-xs text-muted hover:text-error font-medium px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Ancho (cm)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="80"
                  value={glass.widthCm || ''}
                  onChange={(e) => updateGlass(glass.id, 'widthCm', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-muted-light"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Alto (cm)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="150"
                  value={glass.heightCm || ''}
                  onChange={(e) => updateGlass(glass.id, 'heightCm', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-muted-light"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={glass.quantity}
                  onChange={(e) => updateGlass(glass.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 mt-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={glass.isDVH}
                onChange={(e) => updateGlass(glass.id, 'isDVH', e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-xs text-muted group-hover:text-foreground">
                Es vidrio DVH (doble vidriado hermético)
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* DVH warning */}
      {hasDVH && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-amber-600 text-lg">⚠</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            Los vidrios DVH requieren instalación por el lado exterior con material especial.
            Se cotizarán por separado con film espejado exterior.
          </p>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={addGlass}
        className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted font-semibold hover:border-accent hover:text-accent hover:bg-accent-lighter/20 cursor-pointer"
      >
        + Agregar otro vidrio
      </button>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-foreground font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Cambiar material
        </button>
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className="px-8 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-dark shadow-lg shadow-accent/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
        >
          Calcular corte
        </button>
      </div>
    </div>
  );
}
