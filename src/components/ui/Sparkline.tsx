'use client';

import { useId } from 'react';

import { cn } from '@/lib/parser/utils';

/** Lightweight inline SVG sparkline — no chart library overhead. */
export function Sparkline({
  data,
  color = '#22d3ee',
  height = 36,
  width = 120,
  fill = true,
  strokeWidth = 1.6,
  className,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
  strokeWidth?: number;
  className?: string;
}) {
  const gradientId = useId();
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / Math.max(1, data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / span) * (height - 6) - 3;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={cn('overflow-visible', className)}
      aria-hidden
    >
      {fill ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
        </>
      ) : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1]?.[0] ?? 0}
        cy={points[points.length - 1]?.[1] ?? 0}
        r={2.2}
        fill={color}
      />
    </svg>
  );
}

/** Mini bar series used for 7-day outflow velocity. */
export function BarSeries({
  data,
  color = '#fbbf24',
  height = 40,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((value, index) => (
        <BarColumn key={index} value={value} max={max} color={color} />
      ))}
    </div>
  );
}

function BarColumn({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(6, (value / max) * 100);
  return (
    <div
      className="flex-1 rounded-t-sm transition-all duration-500"
      style={{
        height: `${pct}%`,
        background: `linear-gradient(180deg, ${color}, ${color}44)`,
        boxShadow: `0 0 10px -4px ${color}`,
      }}
      title={value.toFixed(0)}
    />
  );
}
