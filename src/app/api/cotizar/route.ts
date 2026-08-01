import { NextRequest, NextResponse } from 'next/server';
import { MATERIALS } from '@/lib/materials';
import { calculateCutting } from '@/lib/cutting-algorithm';
import { encodeGlasses } from '@/lib/quote-params';
import type { GlassInput } from '@/lib/types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface GlassPayload {
  widthCm: number;
  heightCm: number;
  quantity?: number;
  isDVH?: boolean;
}

interface CotizarPayload {
  variantId: string;
  glasses: GlassPayload[];
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: CORS_HEADERS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  let body: CotizarPayload;
  try {
    body = (await req.json()) as CotizarPayload;
  } catch {
    return bad('JSON inválido');
  }

  const { variantId, glasses } = body ?? {};
  if (!variantId || typeof variantId !== 'string') {
    return bad('Falta variantId');
  }
  if (!Array.isArray(glasses) || glasses.length === 0) {
    return bad('glasses debe ser un array con al menos un vidrio');
  }

  let material = null;
  let variant = null;
  for (const m of MATERIALS) {
    const v = m.variants.find((x) => x.id === variantId);
    if (v) {
      material = m;
      variant = v;
      break;
    }
  }
  if (!material || !variant) {
    return bad(`variantId no encontrado: ${variantId}`, 404);
  }

  const normalized: GlassInput[] = [];
  for (let i = 0; i < glasses.length; i++) {
    const g = glasses[i];
    const widthCm = Number(g.widthCm);
    const heightCm = Number(g.heightCm);
    const quantity = Number(g.quantity ?? 1);
    if (!Number.isFinite(widthCm) || widthCm <= 0) {
      return bad(`glasses[${i}].widthCm inválido`);
    }
    if (!Number.isFinite(heightCm) || heightCm <= 0) {
      return bad(`glasses[${i}].heightCm inválido`);
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return bad(`glasses[${i}].quantity debe ser un entero > 0`);
    }
    normalized.push({
      id: `g${i}`,
      widthCm,
      heightCm,
      quantity,
      isDVH: Boolean(g.isDVH),
    });
  }

  const { results, errors } = calculateCutting({
    glasses: normalized,
    bobinWidthCm: variant.bobinWidthCm,
  });

  const linearMeters = results.reduce((sum, r) => sum + r.linearMeters, 0);
  const totalPrice = Math.round(linearMeters * variant.pricePerLinearMeter);

  // URL sin estado del plano de corte, lista para pasarle a un agente o
  // pegar en un chat. Se manda la URL y no la imagen: un PNG en base64
  // acá adentro le comería la ventana de contexto al agente.
  const spec = encodeGlasses(normalized);
  const planoUrlFor = (index: number, format: 'svg' | 'png') =>
    `${req.nextUrl.origin}/api/plano?v=${encodeURIComponent(variant.id)}` +
    `&g=${encodeURIComponent(spec)}${index > 0 ? `&plan=${index}` : ''}` +
    (format === 'png' ? '&format=png' : '');

  const plans = results.map((r, index) => ({
    // svg para imprimir o meter en un PDF; png para mandarlo por chat,
    // que es lo único que renderizan las plataformas de mensajería.
    planoUrl: planoUrlFor(index, 'svg'),
    planoPngUrl: planoUrlFor(index, 'png'),
    linearMeters: r.linearMeters,
    totalLengthCm: r.totalLengthCm,
    bobinWidthCm: r.bobinWidthCm,
    wastePercent: r.wastePercent,
    pieces: r.placedPieces.map((p) => ({
      glassId: p.glassId,
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
      rotated: p.rotated,
      originalWidth: p.originalWidth,
      originalHeight: p.originalHeight,
    })),
  }));

  return NextResponse.json(
    {
      material: {
        id: material.id,
        name: material.name,
        category: material.category,
      },
      variant: {
        id: variant.id,
        label: variant.label,
        bobinWidthCm: variant.bobinWidthCm,
        pricePerLinearMeter: variant.pricePerLinearMeter,
      },
      currency: 'ARS',
      linearMeters,
      totalPrice,
      plans,
      errors,
    },
    { headers: CORS_HEADERS },
  );
}
