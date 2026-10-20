'use client';

import { CalendarClock, Layers, Tag, X } from 'lucide-react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { GROUP_COLOR } from '../group-colors';
import { cn } from '@/lib/parser/utils';

const STATUS_TONE: Record<string, string> = {
  todo: 'bg-slate-500/20 text-slate-400 border-slate-500/25',
  'in-progress': 'bg-nexus-cyan/15 text-nexus-cyan border-nexus-cyan/30',
  blocked: 'bg-nexus-rose/15 text-nexus-rose border-nexus-rose/30',
  done: 'bg-nexus-emerald/15 text-nexus-emerald border-nexus-emerald/30',
  archived: 'bg-slate-700/20 text-slate-500 border-slate-600/25',
};

/** Drawer top — title, status, priority, group. */
export function DrawerHeader({
  task,
  onClose,
}: {
  task: MindMapTaskNode;
  onClose: () => void;
}) {
  const accent = GROUP_COLOR[task.groupCategory] ?? '#22d3ee';

  return (
    <div className="relative border-b border-white/[0.07] px-5 py-4">
      <span
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
                STATUS_TONE[task.status] ?? STATUS_TONE.todo,
              )}
            >
              {task.status}
            </span>
            <span className="chip" style={{ color: accent, borderColor: `${accent}55` }}>
              <Layers className="h-2.5 w-2.5" />
              {task.groupCategory}
            </span>
            <span className="chip">
              <Tag className="h-2.5 w-2.5" />
              {task.priority}
            </span>
            {task.dueDate ? (
              <span className="chip">
                <CalendarClock className="h-2.5 w-2.5" />
                {task.dueDate}
              </span>
            ) : null}
          </div>
          <h2 className="text-base font-semibold leading-tight tracking-tight text-slate-100">
            {task.title}
          </h2>
          <p className="mt-1 font-mono text-[10px] text-slate-600">
            id {task.id} · depth {task.depth} · {task.progress}%{' '}
            {task.isAutoCalculated ? '(auto rollup)' : '(manual)'}
          </p>
        </div>
        <button onClick={onClose} className="btn btn-ghost p-1.5" aria-label="Close drawer">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
