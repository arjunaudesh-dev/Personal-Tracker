'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Coins,
  Link2,
  Paperclip,
  Users,
} from 'lucide-react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { GROUP_COLOR } from './group-colors';
import { cn } from '@/lib/parser/utils';

export interface TaskNodeData extends Record<string, unknown> {
  task: MindMapTaskNode;
  childCount: number;
  onToggleCollapse: (id: string) => void;
  onOpen: (id: string) => void;
}

const STATUS_STYLE: Record<string, { ring: string; dot: string; label: string }> = {
  todo: { ring: 'border-white/12', dot: 'bg-slate-500', label: 'Todo' },
  'in-progress': { ring: 'border-nexus-cyan/45', dot: 'bg-nexus-cyan', label: 'In Progress' },
  blocked: { ring: 'border-nexus-rose/50', dot: 'bg-nexus-rose', label: 'Blocked' },
  done: { ring: 'border-nexus-emerald/45', dot: 'bg-nexus-emerald', label: 'Done' },
  archived: { ring: 'border-white/8', dot: 'bg-slate-700', label: 'Archived' },
};

function TaskNodeInner({ data }: NodeProps) {
  const { task, childCount, onToggleCollapse, onOpen } = data as TaskNodeData;
  const status = STATUS_STYLE[task.status] ?? STATUS_STYLE.todo;
  const accent = GROUP_COLOR[task.groupCategory] ?? '#22d3ee';
  const isOverdue =
    task.dueDate !== null && task.dueDate < new Date().toISOString().slice(0, 10) && task.status !== 'done';

  return (
    <div
      className={cn(
        'group relative w-[252px] rounded-2xl border bg-ink-850/85 p-3 backdrop-blur-md transition-all duration-300',
        status.ring,
        task.status === 'done' ? 'opacity-70' : 'hover:-translate-y-0.5 hover:shadow-glow',
      )}
      style={{
        boxShadow: `0 18px 40px -26px rgba(0,0,0,0.95), inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 0 ${accent}00`,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <span
        className="absolute inset-y-3 left-0 w-[3px] rounded-full"
        style={{ background: accent, boxShadow: `0 0 12px -1px ${accent}` }}
      />

      <div className="flex items-start gap-2 pl-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (childCount > 0) onToggleCollapse(task.id);
          }}
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
            childCount > 0
              ? 'border-white/20 text-slate-400 hover:border-nexus-cyan/60 hover:text-nexus-cyan'
              : 'border-transparent',
          )}
          aria-label={task.isCollapsed ? 'Expand branch' : 'Collapse branch'}
        >
          {task.isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : childCount > 0 ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <CircleDot className="h-2 w-2 text-slate-600" />
          )}
        </button>

        <button onClick={() => onOpen(task.id)} className="min-w-0 flex-1 text-left">
          <p
            className={cn(
              'line-clamp-2 text-[12.5px] font-semibold leading-snug tracking-tight',
              task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-100',
            )}
          >
            {task.title}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
            <span className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
              {status.label}
            </span>
            <span className="text-[9px] text-slate-600">·</span>
            <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: accent }}>
              {task.groupCategory}
            </span>
          </div>
        </button>
      </div>

      <div className="mt-2 pl-7">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${task.progress}%`,
              background: `linear-gradient(90deg, ${accent}, ${accent}55)`,
              boxShadow: `0 0 8px -2px ${accent}`,
            }}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 pl-7 text-[9px] text-slate-500">
        <span className="font-mono">{task.progress}%</span>
        {task.isAutoCalculated ? (
          <span className="chip border-nexus-violet/25 bg-nexus-violet/10 px-1 text-[8px] text-nexus-violet">
            rollup
          </span>
        ) : null}
        {task.cashflow && task.cashflow.actualSpend > 0 ? (
          <span className="flex items-center gap-0.5 text-nexus-amber">
            <Coins className="h-2.5 w-2.5" />
            ${Math.round(task.cashflow.actualSpend).toLocaleString()}
          </span>
        ) : null}
        {task.contacts.length ? (
          <span className="flex items-center gap-0.5">
            <Users className="h-2.5 w-2.5" />
            {task.contacts.length}
          </span>
        ) : null}
        {task.attachments.length ? (
          <span className="flex items-center gap-0.5">
            <Paperclip className="h-2.5 w-2.5" />
            {task.attachments.length}
          </span>
        ) : null}
        {task.aiInsight ? <Link2 className="h-2.5 w-2.5 text-nexus-violet" /> : null}
        <span className="ml-auto flex items-center gap-0.5">
          {isOverdue ? (
            <AlertTriangle className="h-3 w-3 text-nexus-rose" />
          ) : task.dueDate ? (
            <CalendarClock className="h-3 w-3" />
          ) : null}
          {task.dueDate ? <span className="font-mono">{task.dueDate.slice(5)}</span> : null}
        </span>
      </div>
    </div>
  );
}

export const CustomTaskNode = memo(TaskNodeInner);
