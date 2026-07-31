import { NextRequest, NextResponse } from 'next/server';
import { MATERIALS } from '@/lib/materials';
import { calculateCutting } from '@/lib/cutting-algorithm';
import { renderCuttingPlanSVG } from '@/lib/cutting-svg';
import { parseGlasses, countPieces, MAX_PIECES } from '@/lib/quote-params';

// ============================================================
// GET /api/plano — el plano de corte como imagen, desde una URL sin estado.
//
// Toda la cotización viaja en la query string, así que la URL se puede
// pasar de mano en mano (a un agente, a un chat, a un PDF) sin necesidad
// de guardar nada ni de mandar la imagen en base64 — que le comería el
// contexto a un agente.
//
//   /api/plano?v=pol-inter&g=120x90x2,60x180x1
//
// Parámetros:
//   v      variantId del catálogo (ver /api/materiales)
//   g      vidrios: ANCHOxALTOxCANTIDAD,... con sufijo "d" para DVH
//   plan   índice del plano cuando hay normales y DVH (default 0)
//   label  título a dibujar arriba (opcional)
// ============================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: CORS_HEADERS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const variantId = searchParams.get('v');
  if (!variantId) {
    return bad('Falta el parámetro v (variantId)');
  }

  let variant = null;
  let materialName = '';
  for (const m of MATERIALS) {
    const v = m.variants.find((x) => x.id === variantId);
    if (v) {
      variant = v;
      materialName = m.name;
      break;
    }
  }
  if (!variant) {
    return bad(`variantId no encontrado: ${variantId}`, 404);
  }

  const { glasses, error } = parseGlasses(searchParams.get('g'));
  if (error) {
    return bad(error);
  }

  const pieces = countPieces(glasses);
  if (pieces > MAX_PIECES) {
    return bad(`Demasiadas piezas (${pieces}). El máximo por plano es ${MAX_PIECES}.`);
  }

  const { results } = calculateCutting({
    glasses,
    bobinWidthCm: variant.bobinWidthCm,
  });

  if (results.length === 0) {
    return bad('No se pudo generar un plano: ningún vidrio pudo ubicarse en la bobina.', 422);
  }

  const planIndex = Number(searchParams.get('plan') ?? 0);
  const result = results[Number.isInteger(planIndex) ? planIndex : 0];
  if (!result) {
    return bad(`No existe el plano ${planIndex}. Esta cotización tiene ${results.length}.`, 404);
  }

  const label =
    searchParams.get('label') ?? `Plano de corte — ${materialName} (${variant.label})`;

  const svg = renderCuttingPlanSVG(result, { label, standalone: true });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // La URL determina la imagen por completo: es cacheable para siempre.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
