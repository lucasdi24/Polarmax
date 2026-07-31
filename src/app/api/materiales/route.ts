import { NextResponse } from 'next/server';
import { MATERIALS, CUTTING_MARGIN_CM } from '@/lib/materials';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function GET() {
  const materials = MATERIALS.map((m) => ({
    id: m.id,
    category: m.category,
    name: m.name,
    description: m.description,
    variants: m.variants.map((v) => ({
      id: v.id,
      label: v.label,
      bobinWidthCm: v.bobinWidthCm,
      pricePerLinearMeter: v.pricePerLinearMeter,
    })),
  }));

  return NextResponse.json(
    {
      currency: 'ARS',
      cuttingMarginCm: CUTTING_MARGIN_CM,
      updatedAt: '2026-04-01',
      materials,
    },
    { headers: CORS_HEADERS },
  );
}
