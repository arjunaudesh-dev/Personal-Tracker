import React from 'react';
import { Search, LayoutGrid, ChevronsDown, ChevronsUp, Plus, RefreshCw } from 'lucide-react';

interface CanvasToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRelayout: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onAddTask: () => void;
}

export function CanvasToolbar({
  searchQuery,
  onSearchChange,
  onRelayout,
  onExpandAll,
  onCollapseAll,
  onAddTask,
}: CanvasToolbarProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg text-xs">
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter nodes..."
          className="bg-slate-800/90 text-white pl-8 pr-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400 text-xs w-36 sm:w-48"
        />
      </div>

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      <button
        type="button"
        onClick={onRelayout}
        title="Dagre Left-to-Right Relayout"
        className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-1.5 transition-colors"
      >
        <LayoutGrid className="w-4 h-4 text-sky-400" />
        <span className="hidden md:inline text-[11px] font-semibold">Auto LR</span>
      </button>

      <button
        type="button"
        onClick={onExpandAll}
        title="Expand All Nodes"
        className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <ChevronsDown className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onCollapseAll}
        title="Collapse All Subtrees"
        className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <ChevronsUp className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onAddTask}
        className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-glow transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Add Node</span>
      </button>
    </div>
  );
}
