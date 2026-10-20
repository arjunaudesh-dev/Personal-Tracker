'use client';

import { motion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/parser/utils';

type ButtonVariant = 'default' | 'primary' | 'violet' | 'ghost' | 'danger';

export function Button({
  children,
  variant = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    default: '',
    primary: 'btn-primary',
    violet: 'btn-violet',
    ghost: 'btn-ghost',
    danger: 'border-nexus-rose/40 bg-nexus-rose/15 text-nexus-rose hover:border-nexus-rose/70 hover:bg-nexus-rose/25',
  };
  return (
    <button className={cn('btn', variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  active = false,
  className,
  ...props
}: ComponentProps<'button'> & { label: string; active?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200',
        active
          ? 'border-nexus-cyan/50 bg-nexus-cyan/15 text-nexus-cyan'
          : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/25 hover:bg-white/10 hover:text-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: {
  options: Array<{ value: T; label: string; icon?: ReactNode }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl border border-white/10 bg-ink-900/60 p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-lg font-medium transition-colors duration-200',
              size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs',
              active ? 'text-ink-950' : 'text-slate-400 hover:text-slate-100',
            )}
          >
            {active ? (
              <motion.span
                layoutId={`seg-${options.map((o) => o.value).join('-')}`}
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-nexus-cyan to-nexus-sky"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-1.5">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Chip({
  children,
  active = false,
  onClick,
  tone = 'default',
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  tone?: 'default' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: '',
    cyan: 'border-nexus-cyan/40 bg-nexus-cyan/12 text-nexus-cyan',
    violet: 'border-nexus-violet/40 bg-nexus-violet/12 text-nexus-violet',
    emerald: 'border-nexus-emerald/40 bg-nexus-emerald/12 text-nexus-emerald',
    amber: 'border-nexus-amber/40 bg-nexus-amber/12 text-nexus-amber',
    rose: 'border-nexus-rose/40 bg-nexus-rose/12 text-nexus-rose',
  };
  const Component = onClick ? 'button' : 'span';
  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all duration-200',
        onClick && 'cursor-pointer hover:brightness-125',
        active ? tones.cyan : cn('border-white/10 bg-white/[0.04] text-slate-400', tones[tone]),
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-[11px] text-slate-400 transition-colors hover:text-slate-200"
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          'relative h-4 w-7 rounded-full transition-colors duration-200',
          checked ? 'bg-nexus-cyan/70' : 'bg-white/10',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={cn(
            'absolute top-0.5 h-3 w-3 rounded-full bg-white shadow',
            checked ? 'left-3.5' : 'left-0.5',
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-white/[0.04]', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}
