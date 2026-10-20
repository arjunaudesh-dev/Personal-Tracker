import React from 'react';

export interface Stat {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
  spark?: number;
  seed?: number;
}

const sparkPoints = (value: number, seed: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const trend = -t * (value / 100) * 7;
    const wave = Math.sin(t * 7 + seed * 1.7) * 3.2 + Math.sin(t * 13 + seed) * 1.4;
    pts.push(`${(i * 4.4).toFixed(1)},${(16 + trend + wave).toFixed(1)}`);
  }
  return pts.join(' ');
};

export const StatsStrip: React.FC<{ stats: Stat[] }> = ({ stats }) => (
  <div className="stats">
    {stats.map((s, i) => (
      <div
        key={s.label}
        className="stat"
        style={{ ['--stat-accent' as string]: s.accent ?? 'rgba(255,255,255,0.18)' }}
      >
        <div className="stat-label">{s.label}</div>
        <div className="stat-value">
          {s.value}
          {s.sub && <small>{s.sub}</small>}
        </div>
        {s.spark !== undefined && (
          <svg className="stat-spark" viewBox="0 0 50 20" fill="none" aria-hidden="true">
            <polyline
              points={sparkPoints(s.spark, s.seed ?? i)}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    ))}
  </div>
);
