'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '@/lib/parser/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'none';
  hover?: boolean;
  delay?: number;
}

const GLOW_RING: Record<string, string> = {
  cyan: 'before:bg-nexus-cyan/10',
  violet: 'before:bg-nexus-violet/10',
  emerald: 'before:bg-nexus-emerald/10',
  amber: 'before:bg-nexus-amber/10',
  rose: 'before:bg-nexus-rose/10',
  none: '',
};

export function GlassCard({
  children,
  className,
  glow = 'none',
  hover = false,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'glass relative overflow-hidden',
        hover && 'glass-hover',
        GLOW_RING[glow] &&
          'before:pointer-events-none before:absolute before:-right-16 before:-top-16 before:h-40 before:w-40 before:rounded-full before:blur-3xl before:content-[""]',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  icon,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="flex items-start gap-2.5">
        {icon ? (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-nexus-cyan">
            {icon}
          </span>
        ) : null}
        <div>
          {eyebrow ? <p className="label-caps">{eyebrow}</p> : null}
          <h3 className="text-sm font-semibold tracking-tight text-slate-100">{title}</h3>
        </div>
      </div>
      {action}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent', className)} />;
}

export function StatusDot({
  tone = 'emerald',
  pulse = false,
}: {
  tone?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet';
  pulse?: boolean;
}) {
  const tones: Record<string, string> = {
    emerald: 'bg-nexus-emerald',
    amber: 'bg-nexus-amber',
    rose: 'bg-nexus-rose',
    cyan: 'bg-nexus-cyan',
    violet: 'bg-nexus-violet',
  };
  return (
    <span className="relative flex h-2 w-2">
      {pulse ? (
        <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-70', tones[tone])} />
      ) : null}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', tones[tone])} />
    </span>
  );
}
