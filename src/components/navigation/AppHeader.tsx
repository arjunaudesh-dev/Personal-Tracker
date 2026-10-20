'use client';

import {
  Activity,
  Banknote,
  BrainCircuit,
  Command,
  HeartPulse,
  LayoutDashboard,
  Menu,
  Microscope,
  RotateCcw,
  Wifi,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import type { ModuleId } from '@/lib/types/nexus';
import { OPERATOR_PROFILE } from '@/lib/config/profile';
import { cn } from '@/lib/parser/utils';
import { useNexus } from '@/store/nexus-store';

import { CommandPalette } from './CommandPalette';

const MODULES: Array<{ id: ModuleId; label: string; icon: typeof Activity; hint: string }> = [
  { id: 'briefing', label: 'Briefing', icon: LayoutDashboard, hint: 'Cross-system executive briefing' },
  { id: 'mindmap', label: 'Mind-Map', icon: BrainCircuit, hint: 'Task, BOQ & CAD engine' },
  { id: 'finance', label: 'Finance', icon: Banknote, hint: 'Budget & cashflow command center' },
  { id: 'health', label: 'Health', icon: HeartPulse, hint: 'Telemetry, training & nutrition' },
  { id: 'lab', label: 'Lab', icon: Microscope, hint: 'Bloodwork & clinical analyzer' },
];

export function AppHeader() {
  const { state, dispatch, reset } = useNexus();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setModule = (id: ModuleId) => {
    dispatch({ type: 'set-module', module: id });
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `#${id}`);
    setMobileNav(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => setMobileNav((v) => !v)}
            className="btn btn-ghost p-2 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-nexus-cyan/40 bg-gradient-to-br from-nexus-cyan/25 to-nexus-violet/25 shadow-glow">
              <span className="font-mono text-[13px] font-bold text-nexus-cyan">N</span>
              <span className="absolute inset-0 animate-pulse-ring rounded-lg border border-nexus-cyan/30" />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-bold tracking-[0.18em] text-gradient">NEXUS LIFE-OS</p>
              <p className="hidden text-[10px] text-slate-500 sm:block">
                {OPERATOR_PROFILE.role} · {OPERATOR_PROFILE.unit}
              </p>
            </div>
          </div>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              const active = state.activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setModule(mod.id)}
                  className={cn(
                    'group relative flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
                    active
                      ? 'bg-white/[0.08] text-slate-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                      : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5 transition-colors',
                      active ? 'text-nexus-cyan' : 'text-slate-600 group-hover:text-slate-300',
                    )}
                  />
                  {mod.label}
                  {active ? (
                    <span className="absolute inset-x-3 -bottom-[11px] h-px bg-gradient-to-r from-transparent via-nexus-cyan to-transparent" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-500 transition-colors hover:border-white/20 hover:text-slate-300 sm:flex"
            >
              <Command className="h-3 w-3" />
              Search everything
              <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 font-mono text-[9px] text-slate-400">
                ⌘K
              </kbd>
            </button>

            <div className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-0.5 sm:flex">
              {(['USD', 'LKR'] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => dispatch({ type: 'set-currency', currency: code })}
                  className={cn(
                    'rounded-lg px-2 py-1 font-mono text-[10px] font-semibold transition-all',
                    state.currency === code
                      ? 'bg-nexus-cyan/20 text-nexus-cyan'
                      : 'text-slate-500 hover:text-slate-300',
                  )}
                >
                  {code}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-nexus-emerald md:flex">
              <Wifi className="h-3 w-3" />
              SYSTEMS NOMINAL
            </div>

            <button
              onClick={reset}
              title="Reset demo data"
              className="btn btn-ghost hidden p-2 sm:inline-flex"
              aria-label="Reset data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {mobileNav ? (
          <div className="border-t border-white/[0.07] bg-ink-950/95 px-4 py-2 lg:hidden">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => setModule(mod.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium',
                    state.activeModule === mod.id ? 'bg-white/[0.08] text-nexus-cyan' : 'text-slate-400',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {mod.label}
                  <span className="ml-auto text-[10px] text-slate-600">{mod.hint}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
