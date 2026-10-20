'use client';

import { Hand, MousePointer2, PenLine, Share2, Wand2 } from 'lucide-react';

import { cn } from '@/lib/parser/utils';

export type CanvasTool = 'select' | 'pan' | 'draw' | 'link';

const TOOLS: Array<{ id: CanvasTool; label: string; icon: typeof Hand; tone: string }> = [
  { id: 'select', label: 'Select & inspect', icon: MousePointer2, tone: 'text-nexus-cyan' },
  { id: 'pan', label: 'Pan canvas', icon: Hand, tone: 'text-nexus-sky' },
  { id: 'draw', label: 'Freehand CAD overlay', icon: PenLine, tone: 'text-nexus-violet' },
  { id: 'link', label: 'Cross-space linker', icon: Share2, tone: 'text-nexus-amber' },
];

/** Floating tool dock (Select · Pan · Draw · Connect). */
export function CanvasToolDock({
  active,
  onChange,
  onAutoLayout,
}: {
  active: CanvasTool;
  onChange: (tool: CanvasTool) => void;
  onAutoLayout: () => void;
}) {
  return (
    <div className="pointer-events-auto flex flex-col gap-1 rounded-2xl border border-white/10 bg-ink-900/85 p-1.5 shadow-glass backdrop-blur-xl">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isActive = active === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onChange(tool.id)}
            title={tool.label}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200',
              isActive
                ? 'border-white/20 bg-white/[0.10] shadow-glass'
                : 'border-transparent hover:bg-white/[0.06]',
              isActive ? tool.tone : 'text-slate-500 hover:text-slate-300',
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
      <div className="my-0.5 h-px w-full bg-white/10" />
      <button
        onClick={onAutoLayout}
        title="Re-run dagre layout"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-nexus-emerald"
      >
        <Wand2 className="h-4 w-4" />
      </button>
    </div>
  );
}
