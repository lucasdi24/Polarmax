'use client';

import { useMemo } from 'react';
import type { CuttingResult } from '@/lib/types';

// Colores para distinguir cada pieza
const PIECE_COLORS = [
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#e11d48', // rose
];

interface CuttingPlanCanvasProps {
  result: CuttingResult;
  label?: string;
}

export default function CuttingPlanCanvas({
  result,
  label,
}: CuttingPlanCanvasProps) {
  const { placedPieces, bobinWidthCm, totalLengthCm } = result;

  // Calcular escala para que quepa en el contenedor
  const maxViewWidth = 800;
  const padding = 40;

  const scale = useMemo(() => {
    // Escalar para que el ancho de la bobina llene el contenedor
    return (maxViewWidth - padding * 2) / bobinWidthCm;
  }, [bobinWidthCm]);

  const svgWidth = maxViewWidth;
  const svgHeight = totalLengthCm * scale + padding * 2 + 30; // +30 para labels

  return (
    <div className="space-y-2">
      {label && (
        <h4 className="text-sm font-semibold text-muted">{label}</h4>
      )}

      <div className="overflow-auto rounded-xl border border-border bg-white" style={{ maxHeight: '520px' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width={svgWidth}
          height={svgHeight}
          className="block"
        >
          {/* Bobina background */}
          <rect
            x={padding}
            y={padding}
            width={bobinWidthCm * scale}
            height={totalLengthCm * scale}
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth={1}
            rx={2}
          />

          {/* Piezas */}
          {placedPieces.map((piece, i) => {
            const color = PIECE_COLORS[i % PIECE_COLORS.length];
            const px = padding + piece.x * scale;
            const py = padding + piece.y * scale;
            const pw = piece.width * scale;
            const ph = piece.height * scale;

            // Determinar si el texto cabe
            const showFullLabel = pw > 60 && ph > 30;
            const showSmallLabel = pw > 30 && ph > 20;

            return (
              <g key={piece.id}>
                <rect
                  x={px}
                  y={py}
                  width={pw}
                  height={ph}
                  fill={color}
                  fillOpacity={0.15}
                  stroke={color}
                  strokeWidth={1.5}
                  rx={2}
                />
                {showFullLabel ? (
                  <>
                    <text
                      x={px + pw / 2}
                      y={py + ph / 2 - 6}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={11}
                      fontWeight={600}
                      fill={color}
                    >
                      V{piece.id + 1}
                    </text>
                    <text
                      x={px + pw / 2}
                      y={py + ph / 2 + 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={9}
                      fill="#64748b"
                    >
                      {piece.originalWidth}x{piece.originalHeight}
                      {piece.rotated ? ' ↻' : ''}
                    </text>
                  </>
                ) : showSmallLabel ? (
                  <text
                    x={px + pw / 2}
                    y={py + ph / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fontWeight={600}
                    fill={color}
                  >
                    V{piece.id + 1}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* Dimensión: ancho de bobina */}
          <line
            x1={padding}
            y1={padding - 15}
            x2={padding + bobinWidthCm * scale}
            y2={padding - 15}
            stroke="#94a3b8"
            strokeWidth={1}
            markerStart="url(#arrow)"
            markerEnd="url(#arrow)"
          />
          <text
            x={padding + (bobinWidthCm * scale) / 2}
            y={padding - 20}
            textAnchor="middle"
            fontSize={10}
            fill="#64748b"
          >
            Ancho bobina: {bobinWidthCm} cm
          </text>

          {/* Dimensión: largo total */}
          <line
            x1={padding - 15}
            y1={padding}
            x2={padding - 15}
            y2={padding + totalLengthCm * scale}
            stroke="#94a3b8"
            strokeWidth={1}
          />
          <text
            x={padding - 20}
            y={padding + (totalLengthCm * scale) / 2}
            textAnchor="middle"
            fontSize={10}
            fill="#64748b"
            transform={`rotate(-90, ${padding - 20}, ${padding + (totalLengthCm * scale) / 2})`}
          >
            {(totalLengthCm / 100).toFixed(2)} m lineales
          </text>

          {/* Arrow marker def */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  );
}
