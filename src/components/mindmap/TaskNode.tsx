'use client';

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Task } from '@/types/nexus';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useNexus } from '@/lib/store';
import { cn, formatMoney } from '@/lib/utils';
import { boqTotal } from '@/lib/rollup';

export interface TaskNodeData extends Record<string, unknown> { task: Task; progress: number; childCount: number }
export type TaskFlowNode = Node<TaskNodeData, 'task'>;

const STATUS_RING: Record<Task['status'], string> = {
  todo: 'border-slate-500/30',
  doing: 'border-amber-400/50 shadow-[0_0_24px_-6px_rgba(251,191,36,0.5)]',
  done: 'border-lime-400/50 shadow-[0_0_24px_-6px_rgba(163,230,53,0.5)]',
};

function TaskNodeImpl({ data, selected }: NodeProps<TaskFlowNode>) {
  const { task, progress, childCount } = data;
  const { toggleCollapse, state } = useNexus();
  const cost = boqTotal(task);
  const pendingLinked = state.transactions.filter((x) => x.linkedTaskId === task.id).reduce((s, x) => s + x.amount, 0);
  const Chevron = task.collapsed ? ChevronRight : ChevronDown;

  return (
    <div className={cn('glass w-[230px] p-3 transition', STATUS_RING[task.status as Task['status']], selected && 'ring-2 ring-cyan-400/60')}>
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-0 !bg-cyan-400" />
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] uppercase tracking-wider text-slate-500">{task.group}</p>
          <p className="line-clamp-2 text-sm font-semibold leading-snug">{task.title}</p>
        </div>
        {childCount > 0 && (
          <button
            aria-label={task.collapsed ? 'Expand branch' : 'Collapse branch'}
            onClick={(e) => { e.stopPropagation(); toggleCollapse(task.id); }}
            className="nodrag rounded-md p-0.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <Chevron className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span>{task.status === 'done' ? 'Done' : task.status === 'doing' ? 'In progress' : 'To do'}</span>
        <span className="font-semibold text-slate-200">{progress}%</span>
      </div>
      <ProgressBar value={progress} className="mt-1" />
      <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
        {cost > 0 && <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-violet-200">BOQ {formatMoney(cost)}</span>}
        {pendingLinked > 0 && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-200">Spent {formatMoney(pendingLinked)}</span>}
        {task.priority === 'high' && <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-pink-200">High</span>}
      </div>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-0 !bg-violet-400" />
    </div>
  );
}

export const TaskNode = memo(TaskNodeImpl);
