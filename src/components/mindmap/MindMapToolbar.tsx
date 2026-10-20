'use client';

import {
  ChevronsDownUp,
  ChevronsUpDown,
  Download,
  Keyboard,
  Plus,
  Redo2,
  Search,
  Undo2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/parser/utils';
import { useNexus } from '@/store/nexus-store';

/** Floating HUD — search, undo/redo, collapse control, export, shortcuts. */
export function MindMapToolbar({
  onAddNode,
  onShowShortcuts,
  onAutoLayout,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  onAddNode: () => void;
  onShowShortcuts: () => void;
  onAutoLayout: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  const { state, dispatch } = useNexus();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return state.tasks
      .filter((t) => `${t.title} ${t.groupCategory} ${t.tags.join(' ')}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, state.tasks]);

  const collapseAll = () => {
    state.tasks
      .filter((t) => state.tasks.some((c) => c.parentId === t.id) && !t.isCollapsed)
      .forEach((t) => dispatch({ type: 'set-collapsed', id: t.id, collapsed: true }));
  };

  const expandAll = () => {
    state.tasks
      .filter((t) => t.isCollapsed)
      .forEach((t) => dispatch({ type: 'set-collapsed', id: t.id, collapsed: false }));
  };

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ tasks: state.tasks, links: state.links }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-mindmap-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/10 bg-ink-900/85 p-1.5 shadow-glass backdrop-blur-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 160)}
          placeholder="Search task graph…"
          className="w-44 rounded-xl border border-white/10 bg-ink-950/60 py-1.5 pl-8 pr-2.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:border-nexus-cyan/50 focus:outline-none"
        />
        {focused && results.length > 0 ? (
          <div className="absolute left-0 top-full z-30 mt-1 w-72 overflow-hidden rounded-xl border border-white/12 bg-ink-900/98 shadow-2xl backdrop-blur-xl">
            {results.map((task) => (
              <button
                key={task.id}
                onMouseDown={() => {
                  dispatch({ type: 'select-task', taskId: task.id });
                  setQuery('');
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-white/[0.06]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-nexus-cyan" />
                <span className="min-w-0 flex-1 truncate">{task.title}</span>
                <span className="font-mono text-[9px] text-slate-600">{task.progress}%</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="h-5 w-px bg-white/10" />

      <button
        onClick={onAddNode}
        className="btn btn-primary h-8 gap-1.5 px-2.5 text-[11px]"
        title="Add root task"
      >
        <Plus className="h-3.5 w-3.5" />
        Task
      </button>

      <button onClick={onUndo} disabled={!canUndo} className="btn h-8 w-8 p-0" title="Undo (Ctrl+Z)">
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className="btn h-8 w-8 p-0" title="Redo (Ctrl+Y)">
        <Redo2 className="h-3.5 w-3.5" />
      </button>

      <button onClick={collapseAll} className="btn h-8 w-8 p-0" title="Collapse all branches">
        <ChevronsDownUp className="h-3.5 w-3.5" />
      </button>
      <button onClick={expandAll} className="btn h-8 w-8 p-0" title="Expand all branches">
        <ChevronsUpDown className="h-3.5 w-3.5" />
      </button>
      <button onClick={onAutoLayout} className="btn h-8 w-8 p-0" title="Re-run dagre layout">
        <Wand2Icon />
      </button>

      <div className="h-5 w-px bg-white/10" />

      <button onClick={exportJson} className="btn h-8 w-8 p-0" title="Export graph JSON">
        <Download className="h-3.5 w-3.5" />
      </button>
      <button onClick={onShowShortcuts} className="btn h-8 w-8 p-0" title="Keyboard shortcuts">
        <Keyboard className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Wand2Icon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m15 4 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" strokeLinejoin="round" />
      <path d="M6 14 4 20l6-2 8-8-4-4-8 8Z" strokeLinejoin="round" />
    </svg>
  );
}
