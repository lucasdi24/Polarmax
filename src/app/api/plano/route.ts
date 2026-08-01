import { createElement } from 'react';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
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
 * Tipografía del PNG. Se le pasa explícitamente a ImageResponse porque el
 * .ttf que trae Next adentro no sobrevive al empaquetado de la función
 * serverless, y sin fuente resvg dibuja cuadraditos en vez de letras.
 * Se lee una sola vez por instancia.
 */
let fontCache: Promise<Buffer> | null = null;
function loadFont(): Promise<Buffer> {
  fontCache ??= readFile(join(process.cwd(), 'assets/Geist-Regular.ttf'));
  return fontCache;
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

  // El SVG se rasteriza embebido como <img>: así el PNG sale del mismo
  // dibujo que la web, en vez de una segunda versión hecha en JSX que se
  // desincronizaría. Las fuentes las aporta ImageResponse (Geist).
  const { width, height } = svgSize(svg);
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;

  try {
    const font = await loadFont();
    const image = new ImageResponse(
      createElement(
        'div',
        { style: { display: 'flex', width: `${width}px`, height: `${height}px`, background: '#ffffff' } },
        createElement('img', { src: dataUri, width, height })
      ),
      {
        width,
        height,
        fonts: [{ name: 'Geist', data: font, weight: 400, style: 'normal' }],
      }
    );

    return new NextResponse(await image.arrayBuffer(), {
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

/** Lee el tamaño que declara el SVG standalone. */
function svgSize(svg: string): { width: number; height: number } {
  const m = svg.match(/width="([\d.]+)" height="([\d.]+)"/);
  return m
    ? { width: Math.round(Number(m[1])), height: Math.round(Number(m[2])) }
    : { width: 700, height: 900 };
}
