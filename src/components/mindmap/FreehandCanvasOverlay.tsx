'use client';

import { useCallback, useRef, useState } from 'react';

export interface Stroke {
  id: string;
  points: Array<{ x: number; y: number }>;
}

const COLORS = ['#22d3ee', '#a78bfa', '#fbbf24', '#fb7185', '#34d399'];

/**
 * CAD-style freehand drawing overlay that sits above the React Flow canvas.
 * Enabled only while the "Draw" tool is active.
 */
export function FreehandCanvasOverlay({
  enabled,
  strokes,
  onComplete,
  onClear,
}: {
  enabled: boolean;
  strokes: Stroke[];
  onComplete?: (points: Array<{ x: number; y: number }>) => void;
  onClear: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [current, setCurrent] = useState<Array<{ x: number; y: number }>>([]);
  const colorRef = useRef(COLORS[strokes.length % COLORS.length]);
  const drawingRef = useRef(false);

  const toLocal = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!enabled) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drawingRef.current = true;
    colorRef.current = COLORS[(strokes.length + current.length) % COLORS.length];
    setCurrent([toLocal(e)]);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!enabled || !drawingRef.current) return;
    setCurrent((prev) => [...prev, toLocal(e)]);
  };

  const onPointerUp = () => {
    if (!enabled || !drawingRef.current) return;
    drawingRef.current = false;
    if (current.length > 1) {
      onComplete?.(current);
    }
    setCurrent([]);
  };

  const toPath = (points: Array<{ x: number; y: number }>) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{ pointerEvents: enabled ? 'auto' : 'none' }}
    >
      <svg
        ref={svgRef}
        className="h-full w-full"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {strokes.map((stroke, i) => (
          <path
            key={stroke.id}
            d={toPath(stroke.points)}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
        ))}
        {current.length > 1 ? (
          <path
            d={toPath(current)}
            fill="none"
            stroke={colorRef.current}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>

      {enabled ? (
        <div className="pointer-events-auto absolute left-1/2 top-4 -translate-x-1/2">
          <button
            onClick={onClear}
            className="btn border-nexus-rose/40 bg-nexus-rose/15 text-nexus-rose hover:bg-nexus-rose/25"
          >
            Clear CAD strokes
          </button>
        </div>
      ) : null}
    </div>
  );
}
