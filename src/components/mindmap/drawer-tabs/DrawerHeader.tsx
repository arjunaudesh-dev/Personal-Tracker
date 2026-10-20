import React from 'react';
import { X, CheckCircle, Clock, AlertTriangle, Circle } from 'lucide-react';
import { MindMapTaskNode, TaskPriority, TaskStatus } from '@/types/mindmap';

interface DrawerHeaderProps {
  task: MindMapTaskNode;
  onClose: () => void;
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
}

export function DrawerHeader({ task, onClose, onUpdate }: DrawerHeaderProps) {
  return (
    <div className="p-4 border-b border-white/10 bg-slate-900/90 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
            {task.groupCategory}
          </span>
          <span className="text-xs text-slate-400 font-mono">ID: {task.id.slice(0, 8)}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <input
        type="text"
        value={task.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        className="text-lg font-bold bg-transparent text-white border-b border-transparent hover:border-slate-700 focus:border-sky-400 focus:outline-none transition-colors"
      />

      <div className="flex items-center gap-2 text-xs">
        {/* Status selector */}
        <select
          value={task.status}
          onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })}
          className="bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-sky-400"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="done">Completed</option>
        </select>

        {/* Priority selector */}
        <select
          value={task.priority}
          onChange={(e) => onUpdate({ priority: e.target.value as TaskPriority })}
          className="bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-sky-400"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent</option>
        </select>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <span>Progress:</span>
          <input
            type="number"
            min={0}
            max={100}
            value={task.progress}
            onChange={(e) => onUpdate({ progress: Math.min(100, Math.max(0, Number(e.target.value))) })}
            className="w-14 bg-slate-800 border border-white/10 rounded px-1.5 py-0.5 text-center text-sky-400 font-bold"
          />
          <span>%</span>
        </div>
      </div>
    </div>
  );
}
