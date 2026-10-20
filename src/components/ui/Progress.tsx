'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/parser/utils';

export function ProgressBar({
  value,
  className,
  tone = 'cyan',
  height = 6,
  showLabel = false,
}: {
  value: number;
  className?: string;
  tone?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  height?: number;
  showLabel?: boolean;
}) {
  const tones: Record<string, string> = {
    cyan: 'from-nexus-cyan to-nexus-sky',
    violet: 'from-nexus-violet to-nexus-rose',
    emerald: 'from-nexus-emerald to-nexus-cyan',
    amber: 'from-nexus-amber to-nexus-rose',
    rose: 'from-nexus-rose to-nexus-violet',
  };
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="relative w-full overflow-hidden rounded-full bg-white/[0.07]"
        style={{ height }}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn('h-full rounded-full bg-gradient-to-r', tones[tone])}
        />
      </div>
      {showLabel ? (
        <span className="w-9 shrink-0 text-right font-mono text-[10px] text-slate-400">
          {Math.round(clamped)}%
        </span>
      ) : null}
    </div>
  );
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  tone = 'cyan',
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  label?: string;
  sublabel?: string;
}) {
  const tones: Record<string, string> = {
    cyan: '#22d3ee',
    violet: '#a78bfa',
    emerald: '#34d399',
    amber: '#fbbf24',
    rose: '#fb7185',
  };
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tones[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${tones[tone]}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-mono text-sm font-semibold text-slate-100">
          {label ?? `${Math.round(clamped)}%`}
        </span>
        {sublabel ? (
          <span className="mt-0.5 text-[8px] uppercase tracking-wider text-slate-500">{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}
