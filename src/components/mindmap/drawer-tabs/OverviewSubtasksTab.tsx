import React, { useState } from 'react';
import { Plus, CheckSquare, Square, Calendar, Tag, Trash2 } from 'lucide-react';
import { MindMapTaskNode } from '@/types/mindmap';

interface OverviewSubtasksTabProps {
  task: MindMapTaskNode;
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
}

export function OverviewSubtasksTab({ task, onUpdate }: OverviewSubtasksTabProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const subtasks = task.subtasks || [];

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const updated = [
      ...subtasks,
      { id: `st_${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ];
    onUpdate({ subtasks: updated });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    const completedCount = updated.filter((s) => s.completed).length;
    const progress = Math.round((completedCount / updated.length) * 100);
    onUpdate({ subtasks: updated, progress });
  };

  const handleDeleteSubtask = (id: string) => {
    const updated = subtasks.filter((st) => st.id !== id);
    onUpdate({ subtasks: updated });
  };

  return (
    <div className="space-y-4">
      {/* Due Date & Tags */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-850 p-2.5 rounded-lg border border-white/5">
          <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-sky-400" /> Due Date
          </label>
          <input
            type="date"
            value={task.dueDate || ''}
            onChange={(e) => onUpdate({ dueDate: e.target.value })}
            className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
        </div>

        <div className="bg-slate-850 p-2.5 rounded-lg border border-white/5">
          <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Tag className="w-3.5 h-3.5 text-emerald-400" /> Tags (comma-separated)
          </label>
          <input
            type="text"
            value={(task.tags || []).join(', ')}
            placeholder="Civil, Formwork, Urgent"
            onChange={(e) =>
              onUpdate({
                tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* Markdown Notes */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-1">
          Operational Notes & Directives
        </label>
        <textarea
          rows={3}
          value={task.markdownNotes || ''}
          placeholder="Document technical specifications, site directives, or log notes..."
          onChange={(e) => onUpdate({ markdownNotes: e.target.value })}
          className="w-full bg-slate-800/80 text-slate-200 border border-white/10 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none"
        />
      </div>

      {/* Child Subtasks Checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Execution Checklist ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
          </h4>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {subtasks.map((st) => (
            <div
              key={st.id}
              className="flex items-center justify-between bg-slate-800/60 p-2 rounded border border-white/5 text-xs group"
            >
              <button
                type="button"
                onClick={() => handleToggleSubtask(st.id)}
                className="flex items-center gap-2 text-left flex-1"
              >
                {st.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                )}
                <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-200'}>
                  {st.title}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSubtask(st.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddSubtask} className="flex gap-1.5 mt-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="+ Add quick action item..."
            className="flex-1 bg-slate-800 text-slate-200 border border-white/10 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </form>
      </div>
    </div>
  );
}
