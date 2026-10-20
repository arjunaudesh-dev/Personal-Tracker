'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Banknote,
  BrainCircuit,
  CornerDownLeft,
  HeartPulse,
  LayoutDashboard,
  Microscope,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { ModuleId } from '@/lib/types/nexus';
import { cn } from '@/lib/parser/utils';
import { useNexus } from '@/store/nexus-store';

interface PaletteEntry {
  id: string;
  title: string;
  subtitle: string;
  group: string;
  icon: typeof Search;
  run: () => void;
}

const MODULE_ENTRIES: Array<{ id: ModuleId; title: string; subtitle: string; icon: typeof Search }> = [
  { id: 'briefing', title: 'Executive Briefing', subtitle: 'Cross-system war room & KPIs', icon: LayoutDashboard },
  { id: 'mindmap', title: 'Mind-Map & BOQ Engine', subtitle: 'Task graph, BOQ ledger, CAD overlay', icon: BrainCircuit },
  { id: 'finance', title: 'Financial Command Center', subtitle: '50/30/20 budget & cashflow', icon: Banknote },
  { id: 'health', title: 'Health & Athletic Hub', subtitle: 'Telemetry, gym coach, nutrition', icon: HeartPulse },
  { id: 'lab', title: 'Clinical Lab Analyzer', subtitle: 'Bloodwork extraction & tasks', icon: Microscope },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useNexus();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const entries = useMemo<PaletteEntry[]>(() => {
    const modules: PaletteEntry[] = MODULE_ENTRIES.map((m) => ({
      id: `module-${m.id}`,
      title: m.title,
      subtitle: m.subtitle,
      group: 'Navigate',
      icon: m.icon,
      run: () => {
        dispatch({ type: 'set-module', module: m.id });
        if (typeof window !== 'undefined') window.history.replaceState(null, '', `#${m.id}`);
      },
    }));

    const tasks: PaletteEntry[] = state.tasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      subtitle: `${task.groupCategory} · ${task.status} · ${task.progress}%`,
      group: 'Tasks',
      icon: task.status === 'blocked' ? TrendingDown : TrendingUp,
      run: () => {
        dispatch({ type: 'set-module', module: 'mindmap' });
        dispatch({ type: 'select-task', taskId: task.id });
        if (typeof window !== 'undefined') window.history.replaceState(null, '', '#mindmap');
      },
    }));

    const actions: PaletteEntry[] = [
      {
        id: 'action-currency',
        title: 'Toggle reporting currency',
        subtitle: 'Switch between USD and LKR at 308 LKR/USD',
        group: 'Actions',
        icon: Banknote,
        run: () =>
          dispatch({ type: 'set-currency', currency: state.currency === 'USD' ? 'LKR' : 'USD' }),
      },
      {
        id: 'action-reset',
        title: 'Reset command data',
        subtitle: 'Restore the seeded engineering, finance and health datasets',
        group: 'Actions',
        icon: TrendingUp,
        run: () => window.localStorage.removeItem('nexus-life-os:state:v1'),
      },
    ];

    return [...modules, ...actions, ...tasks];
  }, [state.tasks, state.currency, dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, 40);
    return entries
      .filter((e) => `${e.title} ${e.subtitle} ${e.group}`.toLowerCase().includes(q))
      .slice(0, 40);
  }, [entries, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const entry = filtered[index];
        if (entry) {
          entry.run();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, index, onClose]);

  let lastGroup = '';

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]"
        >
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" onClick={onClose} aria-hidden />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative z-10 w-full max-w-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
              <Search className="h-4 w-4 text-nexus-cyan" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                placeholder="Search tasks, modules and commands…"
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
              />
              <kbd className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
                ESC
              </kbd>
            </div>

            <div className="scroll-thin max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-slate-500">No matches for “{query}”.</p>
              ) : null}
              {filtered.map((entry, i) => {
                const showGroup = entry.group !== lastGroup;
                lastGroup = entry.group;
                const Icon = entry.icon;
                return (
                  <div key={entry.id}>
                    {showGroup ? (
                      <p className="label-caps px-3 pb-1 pt-3">{entry.group}</p>
                    ) : null}
                    <button
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => {
                        entry.run();
                        onClose();
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        i === index ? 'bg-nexus-cyan/12 text-slate-100' : 'text-slate-300 hover:bg-white/[0.04]',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
                          i === index
                            ? 'border-nexus-cyan/40 bg-nexus-cyan/15 text-nexus-cyan'
                            : 'border-white/10 bg-white/[0.04] text-slate-500',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">{entry.title}</span>
                        <span className="block truncate text-[10px] text-slate-500">{entry.subtitle}</span>
                      </span>
                      {i === index ? (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-nexus-cyan" />
                      ) : null}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 border-t border-white/[0.07] bg-ink-900/40 px-4 py-2 text-[10px] text-slate-600">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
              <span className="ml-auto font-mono">{filtered.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
