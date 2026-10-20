import React from 'react';
import {
  Compass,
  GitGraph,
  DollarSign,
  HeartPulse,
  Command,
  Shield,
  Layers,
} from 'lucide-react';
import { SystemModule } from '@/types/nexus';

interface AppHeaderProps {
  activeModule: SystemModule;
  onSelectModule: (module: SystemModule) => void;
  onOpenCommandPalette: () => void;
}

export function AppHeader({
  activeModule,
  onSelectModule,
  onOpenCommandPalette,
}: AppHeaderProps) {
  const navItems = [
    { key: 'briefing' as const, label: 'Executive Briefing', icon: Compass },
    { key: 'mindmap' as const, label: 'Mind-Map & BOQ', icon: GitGraph },
    { key: 'finance' as const, label: 'Capital Velocity', icon: DollarSign },
    { key: 'health' as const, label: 'Health & Clinical Lab', icon: HeartPulse },
  ];

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-glass">
      {/* Brand & Designation */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-glow">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-wider text-white">
              NEXUS <span className="text-sky-400">LIFE-OS</span>
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
              v2.5
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden md:block">
            Civil Engineering & Life Executive Console • Officer Arjuna Kahandawa
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectModule(item.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 text-xs transition-colors"
          title="Command Palette (Ctrl+K or ⌘K)"
        >
          <Command className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden lg:inline text-[11px] font-mono">⌘K</span>
        </button>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>DAEMON :3000 ACTIVE</span>
        </div>
      </div>
    </header>
  );
}
