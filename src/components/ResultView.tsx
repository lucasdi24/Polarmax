'use client';

import type { CuttingResult, CuttingError, Material, FilmVariant } from '@/lib/types';
import { MATERIALS, WHATSAPP_NUMBER, DVH_MATERIAL_ID } from '@/lib/materials';
import CuttingPlanCanvas from './CuttingPlanCanvas';

interface ResultViewProps {
  results: CuttingResult[];
  errors: CuttingError[];
  material: Material;
  variant: FilmVariant;
  hasDVH: boolean;
  onBack: () => void;
  onReset: () => void;
}

function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function ResultView({
  results, errors, material, variant, hasDVH, onBack, onReset,
}: ResultViewProps) {
  const dvhMaterial = MATERIALS.find((m) => m.id === DVH_MATERIAL_ID);
  const dvhVariant = dvhMaterial?.variants[0];

  const normalResult = results[0];
  const dvhResult = hasDVH && results.length > 1 ? results[1] : null;

  const normalPrice = normalResult ? normalResult.linearMeters * variant.pricePerLinearMeter : 0;
  const dvhPrice = dvhResult && dvhVariant ? dvhResult.linearMeters * dvhVariant.pricePerLinearMeter : 0;
  const totalPrice = normalPrice + dvhPrice;
  const totalLinearMeters = (normalResult?.linearMeters ?? 0) + (dvhResult?.linearMeters ?? 0);

  const whatsappQuoteMsg = [
    `Hola! Quiero cotizar film para vidrios:`,
    ``,
    `Material: ${material.name} - ${variant.label}`,
    normalResult ? `Vidrios normales: ${normalResult.placedPieces.length} piezas, ${normalResult.linearMeters.toFixed(2)}m lineales` : null,
    dvhResult ? `Vidrios DVH: ${dvhResult.placedPieces.length} piezas, ${dvhResult.linearMeters.toFixed(2)}m lineales` : null,
    ``,
    `Total estimado: $${totalPrice.toLocaleString('es-AR')}`,
    ``,
    `Calculado con el cotizador de Polarmax`,
  ].filter(Boolean).join('\n');

  const whatsappInstallMsg = [
    `Hola! Quiero consultar por el servicio de colocación profesional:`,
    ``,
    `Material: ${material.name} - ${variant.label}`,
    `Metros lineales estimados: ${totalLinearMeters.toFixed(2)}m`,
    ``,
    `Calculado con el cotizador de Polarmax`,
  ].join('\n');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Tu cotización está lista</h2>
        <p className="text-sm text-muted mt-1">{material.name} — {variant.label}</p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((err, i) => (
            <div key={i} className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <span className="text-red-500">✕</span>
              {err.message}
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-5 rounded-2xl bg-accent-lighter/50 border border-accent/10 text-center">
          <p className="text-3xl font-black text-accent">{totalLinearMeters.toFixed(2)}</p>
          <p className="text-xs text-accent-dark/60 font-medium mt-1">metros lineales</p>
        </div>
        <div className="p-5 rounded-2xl bg-surface border border-border text-center">
          <p className="text-3xl font-black text-foreground">
            {(normalResult?.placedPieces.length ?? 0) + (dvhResult?.placedPieces.length ?? 0)}
          </p>
          <p className="text-xs text-muted font-medium mt-1">piezas totales</p>
        </div>
        <div className="p-5 rounded-2xl bg-surface border border-border text-center">
          <p className="text-3xl font-black text-foreground">
            {normalResult ? normalResult.wastePercent.toFixed(1) : '0'}%
          </p>
          <p className="text-xs text-muted font-medium mt-1">desperdicio</p>
        </div>
        <div className="p-5 rounded-2xl bg-green-900 text-center">
          <p className="text-2xl font-black text-white">${totalPrice.toLocaleString('es-AR')}</p>
          <p className="text-xs text-white/60 font-medium mt-1">precio estimado</p>
        </div>
      </div>

      {/* Cutting plans */}
      {normalResult && normalResult.placedPieces.length > 0 && (
        <CuttingPlanCanvas
          result={normalResult}
          label={dvhResult ? `Plano de corte — Vidrios normales` : 'Plano de corte — Distribución óptima'}
        />
      )}
      {dvhResult && dvhResult.placedPieces.length > 0 && (
        <CuttingPlanCanvas result={dvhResult} label="Plano de corte — Vidrios DVH (Film Exterior)" />
      )}

      {/* Price breakdown */}
      {dvhResult && dvhVariant && (
        <div className="p-5 rounded-2xl bg-surface border border-border text-sm space-y-3">
          <h4 className="font-bold text-foreground">Detalle de precios</h4>
          <div className="flex justify-between">
            <span className="text-muted">
              {material.name} ({normalResult?.linearMeters.toFixed(2)}m x ${variant.pricePerLinearMeter.toLocaleString('es-AR')})
            </span>
            <span className="font-semibold">${normalPrice.toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">
              Film Espejado Exterior DVH ({dvhResult.linearMeters.toFixed(2)}m x ${dvhVariant.pricePerLinearMeter.toLocaleString('es-AR')})
            </span>
            <span className="font-semibold">${dvhPrice.toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-border pt-3">
            <span>Total estimado</span>
            <span className="text-accent">${totalPrice.toLocaleString('es-AR')}</span>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-light text-center italic">
        * Los precios son estimativos y pueden variar. Solicitá una cotización formal para obtener el precio final.
      </p>

      {/* WhatsApp CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={buildWhatsAppUrl(whatsappQuoteMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#1da851] shadow-lg shadow-[#25D366]/20"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Solicitar cotización formal
        </a>
        <a
          href={buildWhatsAppUrl(whatsappInstallMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-accent text-accent font-bold text-sm hover:bg-accent-lighter/30"
        >
          Consultar por colocación profesional
        </a>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="text-sm text-muted hover:text-foreground font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Modificar medidas
        </button>
        <button onClick={onReset} className="text-sm text-accent hover:text-accent-dark font-bold">
          Nueva cotización
        </button>
      </div>
    </div>
  );
}
