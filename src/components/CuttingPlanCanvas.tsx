'use client';

import { useMemo } from 'react';
import type { CuttingResult } from '@/lib/types';

const PIECE_COLORS = [
  '#2d6a2d', '#4caf50', '#1b5e20', '#66bb6a',
  '#388e3c', '#81c784', '#43a047', '#a5d6a7',
  '#2e7d32', '#c8e6c9', '#1a3a1a', '#4caf50',
];

interface CuttingPlanCanvasProps {
  result: CuttingResult;
  label?: string;
}

export default function CuttingPlanCanvas({ result, label }: CuttingPlanCanvasProps) {
  const { placedPieces, bobinWidthCm, totalLengthCm } = result;

  const maxViewWidth = 700;
  const padding = 50;

  const scale = useMemo(() => {
    return (maxViewWidth - padding * 2) / bobinWidthCm;
  }, [bobinWidthCm]);

  const svgWidth = maxViewWidth;
  const svgHeight = totalLengthCm * scale + padding * 2 + 20;

  return (
    <div className="space-y-3">
      {label && <h4 className="text-sm font-bold text-foreground">{label}</h4>}

      <div
        className="overflow-auto rounded-2xl border border-border bg-white shadow-sm"
        style={{ maxHeight: '480px' }}
      >
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width={svgWidth} height={svgHeight} className="block">
          {/* Background */}
          <rect
            x={padding} y={padding}
            width={bobinWidthCm * scale} height={totalLengthCm * scale}
            fill="#f8faf8" stroke="#d1d5db" strokeWidth={1} rx={4}
          />

          {/* Grid lines */}
          {Array.from({ length: Math.ceil(totalLengthCm / 50) }).map((_, i) => (
            <line
              key={`grid-${i}`}
              x1={padding} y1={padding + i * 50 * scale}
              x2={padding + bobinWidthCm * scale} y2={padding + i * 50 * scale}
              stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4 4"
            />
          ))}

          {/* Pieces */}
          {placedPieces.map((piece, i) => {
            const color = PIECE_COLORS[i % PIECE_COLORS.length];
            const px = padding + piece.x * scale;
            const py = padding + piece.y * scale;
            const pw = piece.width * scale;
            const ph = piece.height * scale;
            const showFull = pw > 55 && ph > 28;
            const showSmall = pw > 28 && ph > 18;

            return (
              <g key={piece.id}>
                <rect
                  x={px} y={py} width={pw} height={ph}
                  fill={color} fillOpacity={0.12}
                  stroke={color} strokeWidth={1.5} rx={3}
                />
                {showFull ? (
                  <>
                    <text x={px + pw / 2} y={py + ph / 2 - 7} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight={700} fill={color}>
                      V{piece.id + 1}
                    </text>
                    <text x={px + pw / 2} y={py + ph / 2 + 8} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#6b7280">
                      {piece.originalWidth}x{piece.originalHeight}{piece.rotated ? ' ↻' : ''}
                    </text>
                  </>
                ) : showSmall ? (
                  <text x={px + pw / 2} y={py + ph / 2} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={700} fill={color}>
                    V{piece.id + 1}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* Dimension: width */}
          <text x={padding + (bobinWidthCm * scale) / 2} y={padding - 18} textAnchor="middle" fontSize={11} fontWeight={600} fill="#374151">
            {bobinWidthCm} cm
          </text>
          <line x1={padding} y1={padding - 8} x2={padding + bobinWidthCm * scale} y2={padding - 8} stroke="#9ca3af" strokeWidth={1} />
          <line x1={padding} y1={padding - 12} x2={padding} y2={padding - 4} stroke="#9ca3af" strokeWidth={1} />
          <line x1={padding + bobinWidthCm * scale} y1={padding - 12} x2={padding + bobinWidthCm * scale} y2={padding - 4} stroke="#9ca3af" strokeWidth={1} />

          {/* Dimension: length */}
          <text
            x={padding - 22} y={padding + (totalLengthCm * scale) / 2}
            textAnchor="middle" fontSize={11} fontWeight={600} fill="#374151"
            transform={`rotate(-90, ${padding - 22}, ${padding + (totalLengthCm * scale) / 2})`}
          >
            {(totalLengthCm / 100).toFixed(2)} m
          </text>
          <line x1={padding - 10} y1={padding} x2={padding - 10} y2={padding + totalLengthCm * scale} stroke="#9ca3af" strokeWidth={1} />
          <line x1={padding - 14} y1={padding} x2={padding - 6} y2={padding} stroke="#9ca3af" strokeWidth={1} />
          <line x1={padding - 14} y1={padding + totalLengthCm * scale} x2={padding - 6} y2={padding + totalLengthCm * scale} stroke="#9ca3af" strokeWidth={1} />
        </svg>
      </div>
    </div>
  );
}
