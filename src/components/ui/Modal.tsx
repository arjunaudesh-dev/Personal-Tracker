'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

import { cn } from '@/lib/parser/utils';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-lg',
  accent = 'cyan',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  accent?: 'cyan' | 'violet' | 'emerald' | 'amber';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const accents: Record<string, string> = {
    cyan: 'from-nexus-cyan/70',
    violet: 'from-nexus-violet/70',
    emerald: 'from-nexus-emerald/70',
    amber: 'from-nexus-amber/70',
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'glass relative z-10 max-h-[88vh] w-full overflow-hidden shadow-2xl',
              width,
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className={cn('h-px w-full bg-gradient-to-r via-white/20 to-transparent', accents[accent])} />
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-slate-100">{title}</h2>
                {subtitle ? <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p> : null}
              </div>
              <button onClick={onClose} className="btn btn-ghost -mr-1 -mt-1 p-1.5" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="scroll-thin max-h-[62vh] overflow-y-auto px-5 py-4">{children}</div>
            {footer ? (
              <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] bg-ink-900/40 px-5 py-3">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  width = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
        >
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className={cn(
              'glass absolute right-0 top-0 z-10 flex h-full w-full flex-col rounded-none border-y-0 border-r-0',
              width,
            )}
          >
            {title ? (
              <div className="border-b border-white/[0.07] px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
              </div>
            ) : null}
            <div className="scroll-thin flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
