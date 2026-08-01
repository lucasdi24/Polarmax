import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
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
//   v       variantId del catálogo (ver /api/materiales)
//   g       vidrios: ANCHOxALTOxCANTIDAD,... con sufijo "d" para DVH
//   plan    índice del plano cuando hay normales y DVH (default 0)
//   label   título a dibujar arriba (opcional)
//   format  svg (default) | png
//
// El SVG sirve para imprimir en el taller y para meter en un PDF: es
// vectorial y no se pixela. El PNG existe porque las plataformas de
// mensajería no renderizan SVG, así que un agente que le manda el plano
// a un cliente por chat necesita sí o sí el raster.
// ============================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: CORS_HEADERS });
}

/**
 * Tipografía del PNG. Hay que dársela a resvg explícitamente: no tiene
 * fuentes de sistema, y sin ninguna cargada dibuja cuadraditos en vez de
 * letras. Se lee una sola vez por instancia.
 */
let fontCache: Promise<Buffer> | null = null;
function loadFont(): Promise<Buffer> {
  fontCache ??= readFile(join(process.cwd(), 'assets/Geist-Regular.ttf'));
  return fontCache;
}

/** El WASM de resvg se inicializa una sola vez por instancia. */
let wasmCache: Promise<void> | null = null;
function ensureWasm(): Promise<void> {
  wasmCache ??= readFile(
    join(process.cwd(), 'node_modules/@resvg/resvg-wasm/index_bg.wasm')
  ).then((bin) => initWasm(bin));
  return wasmCache;
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
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

  // La URL determina la imagen por completo: es cacheable para siempre.
  const CACHE = 'public, max-age=31536000, immutable';

  if ((searchParams.get('format') ?? 'svg').toLowerCase() !== 'png') {
    return new NextResponse(svg, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': CACHE,
      },
    });
  }

  // Se rasteriza el mismo SVG que ve la web, en vez de redibujar el plano
  // en otro formato que se desincronizaría.
  try {
    await ensureWasm();
    const font = await loadFont();

    const resvg = new Resvg(svg, {
      font: {
        fontBuffers: [new Uint8Array(font)],
        defaultFontFamily: 'Geist',
      },
      fitTo: { mode: 'original' },
    });
    const png = resvg.render().asPng();

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'image/png',
        'Cache-Control': CACHE,
      },
    });
  } catch {
    return bad('No se pudo generar el PNG del plano.', 500);
  }
}
