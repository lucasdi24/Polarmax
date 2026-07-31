import type { CuttingResult } from '@/lib/types';
import { renderCuttingPlanSVG } from '@/lib/cutting-svg';

interface CuttingPlanCanvasProps {
  result: CuttingResult;
  label?: string;
}

/**
 * Muestra el plano de corte en la web.
 *
 * El dibujo en sí vive en lib/cutting-svg para que /api/plano sirva
 * exactamente la misma imagen que ve el vendedor en pantalla.
 */
export default function CuttingPlanCanvas({ result, label }: CuttingPlanCanvasProps) {
  const svg = renderCuttingPlanSVG(result);

  return (
    <div className="space-y-3">
      {label && <h4 className="text-sm font-bold text-foreground">{label}</h4>}

      <div
        className="rounded-2xl border border-border bg-white shadow-sm p-2"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
