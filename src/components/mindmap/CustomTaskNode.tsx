import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';
import { MindMapTaskNode } from '@/types/mindmap';
import { NodeFooterBadges } from './NodeFooterBadges';
import { NodeQuickActions } from './NodeQuickActions';

interface CustomTaskNodeProps {
  data: {
    task: MindMapTaskNode;
    hasChildren?: boolean;
    onSelect?: (task: MindMapTaskNode) => void;
    onToggleCollapse?: (taskId: string) => void;
    onAddChild?: (parentId: string) => void;
    onOpenLinkModal?: (taskId: string) => void;
    onSetAlarm?: (taskId: string) => void;
    onToggleStatus?: (taskId: string) => void;
  };
  selected?: boolean;
}

export function CustomTaskNode({ data, selected }: CustomTaskNodeProps) {
  const { task, hasChildren } = data;

  const priorityColors = {
    urgent: 'border-rose-500/60 bg-rose-950/20 shadow-rose-900/30 text-rose-300',
    high: 'border-amber-500/60 bg-amber-950/20 shadow-amber-900/30 text-amber-300',
    medium: 'border-sky-500/50 bg-sky-950/20 shadow-sky-900/20 text-sky-300',
    low: 'border-slate-700 bg-slate-900/30 text-slate-400',
  };

  const statusColors = {
    done: 'border-emerald-500/60 shadow-glow-emerald',
    in_progress: 'border-sky-500/60 shadow-glow',
    blocked: 'border-rose-500/80 shadow-red-900/40',
    todo: 'border-slate-700/80',
  };

  return (
    <div
      onClick={() => data.onSelect?.(task)}
      className={`group relative w-[280px] p-3 rounded-xl backdrop-blur-md bg-slate-900/85 border transition-all duration-200 cursor-pointer ${
        statusColors[task.status]
      } ${selected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-[1.02]' : 'hover:border-sky-400/70'}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-sky-400 !border-2 !border-slate-900"
      />

      <NodeQuickActions
        task={task}
        onAddChild={data.onAddChild}
        onOpenLinkModal={data.onOpenLinkModal}
        onSetAlarm={data.onSetAlarm}
        onToggleStatus={data.onToggleStatus}
      />

      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                data.onToggleCollapse?.(task.id);
              }}
              className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"
            >
              {task.isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <span
            className={`text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider rounded border ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority}
          </span>

          <span className="text-[10px] text-slate-400 truncate">
            {task.groupCategory}
          </span>
        </div>

        <span className="text-[11px] font-mono font-bold text-slate-300">
          {task.progress}%
        </span>
      </div>

      <div className="font-semibold text-xs text-white line-clamp-2 leading-tight">
        {task.title}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            task.status === 'done'
              ? 'bg-emerald-400'
              : task.status === 'blocked'
              ? 'bg-rose-500'
              : 'bg-sky-400'
          }`}
          style={{ width: `${task.progress}%` }}
        />
      </div>

      <NodeFooterBadges task={task} />

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-sky-400 !border-2 !border-slate-900"
      />
    </div>
  );
}
