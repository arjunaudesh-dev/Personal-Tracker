import React from 'react';
import { Plus, Link2, Bell, CheckCircle2 } from 'lucide-react';
import { MindMapTaskNode } from '@/types/mindmap';

interface NodeQuickActionsProps {
  task: MindMapTaskNode;
  onAddChild?: (parentId: string) => void;
  onOpenLinkModal?: (taskId: string) => void;
  onSetAlarm?: (taskId: string) => void;
  onToggleStatus?: (taskId: string) => void;
}

export function NodeQuickActions({
  task,
  onAddChild,
  onOpenLinkModal,
  onSetAlarm,
  onToggleStatus,
}: NodeQuickActionsProps) {
  return (
    <div className="absolute -top-3.5 right-2 hidden group-hover:flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-sky-500/40 shadow-glow transition-all">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAddChild?.(task.id);
        }}
        title="Add Child Subtask (Tab)"
        className="p-1 text-slate-300 hover:text-sky-400 hover:bg-white/10 rounded-full transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenLinkModal?.(task.id);
        }}
        title="Cross-Group Link"
        className="p-1 text-slate-300 hover:text-amber-400 hover:bg-white/10 rounded-full transition-colors"
      >
        <Link2 className="w-3 h-3" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSetAlarm?.(task.id);
        }}
        title="Set Alarm / Calendar"
        className="p-1 text-slate-300 hover:text-violet-400 hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell className="w-3 h-3" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus?.(task.id);
        }}
        title="Toggle Status (Done/In-Progress)"
        className={`p-1 rounded-full transition-colors ${
          task.status === 'done'
            ? 'text-emerald-400 bg-emerald-500/20'
            : 'text-slate-300 hover:text-emerald-400 hover:bg-white/10'
        }`}
      >
        <CheckCircle2 className="w-3 h-3" />
      </button>
    </div>
  );
}
