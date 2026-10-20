import React from 'react';
import { MousePointer, Move, PenTool, GitBranch, Keyboard, ShieldCheck } from 'lucide-react';

export type CanvasToolMode = 'select' | 'pan' | 'draw' | 'connect';

interface CanvasToolDockProps {
  mode: CanvasToolMode;
  onChangeMode: (m: CanvasToolMode) => void;
  onOpenShortcuts: () => void;
  onOpenCmsys: () => void;
}

export function CanvasToolDock({
  mode,
  onChangeMode,
  onOpenShortcuts,
  onOpenCmsys,
}: CanvasToolDockProps) {
  const tools: Array<{ mode: CanvasToolMode; icon: any; title: string }> = [
    { mode: 'select', icon: MousePointer, title: 'Pointer / Select Mode (V)' },
    { mode: 'pan', icon: Move, title: 'Canvas Pan Mode (H)' },
    { mode: 'draw', icon: PenTool, title: 'CAD Blueprint Markup / Draw (D)' },
    { mode: 'connect', icon: GitBranch, title: 'Cross-Link Mode (C)' },
  ];

  return (
    <div className="flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = mode === t.mode;
        return (
          <button
            key={t.mode}
            type="button"
            onClick={() => onChangeMode(t.mode)}
            title={t.title}
            className={`p-2 rounded-lg transition-all ${
              isActive
                ? 'bg-sky-500 text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}

      <div className="w-full h-px bg-white/10 my-1" />

      <button
        type="button"
        onClick={onOpenCmsys}
        title="Military CMSYS Naval Sync"
        className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all"
      >
        <ShieldCheck className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onOpenShortcuts}
        title="Keyboard Shortcuts Cheat Sheet (?)"
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
      >
        <Keyboard className="w-4 h-4" />
      </button>
    </div>
  );
}
