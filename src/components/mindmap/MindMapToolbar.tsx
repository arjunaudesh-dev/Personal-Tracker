import React from 'react';
import { Download, SlidersHorizontal, Sparkles } from 'lucide-react';

interface MindMapToolbarProps {
  onExportJson: () => void;
  taskCount: number;
  completedCount: number;
}

export function MindMapToolbar({
  onExportJson,
  taskCount,
  completedCount,
}: MindMapToolbarProps) {
  const percent = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 uppercase">Tree Progress:</span>
        <span className="font-bold text-emerald-400">{percent}%</span>
        <span className="text-slate-500">({completedCount}/{taskCount})</span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      <button
        type="button"
        onClick={onExportJson}
        title="Export Graph Snapshot JSON"
        className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        <Download className="w-3.5 h-3.5 text-sky-400" />
        <span className="text-[11px]">Snapshot</span>
      </button>
    </div>
  );
}
