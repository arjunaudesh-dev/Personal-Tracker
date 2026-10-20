'use client';

import { Check, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { useNexus } from '@/store/nexus-store';
import { uid } from '@/lib/parser/utils';
import { cn } from '@/lib/parser/utils';

import { ProgressBar } from '@/components/ui/Progress';

/** Tab 1 — priority, deadlines and child checklist with live rollup. */
export function OverviewSubtasksTab({ task }: { task: MindMapTaskNode }) {
  const { state, dispatch } = useNexus();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  const children = state.tasks.filter((t) => t.parentId === task.id);

  const addChild = () => {
    const label = title.trim();
    if (!label) return;
    dispatch({
      type: 'add-task',
      task: {
        id: uid('task'),
        parentId: task.id,
        boardId: task.boardId,
        title: label,
        markdownNotes: '',
        groupCategory: task.groupCategory,
        direction: task.direction,
        depth: task.depth + 1,
        posX: 0,
        posY: 0,
        status: 'todo',
        priority: task.priority,
        tags: [],
        isCollapsed: false,
        progress: 0,
        isAutoCalculated: false,
        cashflow: null,
        reminders: [],
        attachments: [],
        contacts: [],
        aiInsight: null,
        dueDate: task.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    setTitle('');
    setAdding(false);
  };

  const cycleStatus = (id: string, status: string) => {
    const order = ['todo', 'in-progress', 'blocked', 'done'];
    const next = order[(order.indexOf(status) + 1) % order.length];
    dispatch({ type: 'update-task', id, patch: { status: next as never } });
  };

  return (
    <div className="space-y-5">
      <section>
        <p className="label-caps mb-2">Notes</p>
        <textarea
          value={task.markdownNotes}
          onChange={(e) =>
            dispatch({ type: 'update-task', id: task.id, patch: { markdownNotes: e.target.value } })
          }
          rows={4}
          placeholder="Site notes, method statements, inspection remarks…"
          className="input resize-y leading-relaxed"
        />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="label-caps">Priority & progress</p>
          <select
            value={task.priority}
            onChange={(e) =>
              dispatch({
                type: 'update-task',
                id: task.id,
                patch: { priority: e.target.value as never },
              })
            }
            className="input w-auto py-1 text-[10px]"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <ProgressBar value={task.progress} tone="cyan" showLabel height={7} />
        {task.isAutoCalculated ? (
          <p className="mt-1.5 text-[10px] text-slate-600">
            Auto-calculated from {children.length} child task{children.length === 1 ? '' : 's'}.
          </p>
        ) : null}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="label-caps">Child checklist ({children.length})</p>
          <button onClick={() => setAdding((v) => !v)} className="btn h-7 gap-1 px-2 text-[10px]">
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>

        {adding ? (
          <div className="mb-2 flex gap-1.5">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addChild()}
              placeholder="New subtask title…"
              className="input"
            />
            <button onClick={addChild} className="btn btn-primary h-auto">
              Add
            </button>
          </div>
        ) : null}

        <ul className="space-y-1">
          {children.map((child) => (
            <li key={child.id}>
              <button
                onClick={() => dispatch({ type: 'select-task', taskId: child.id })}
                className="group flex w-full items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-white/15 hover:bg-white/[0.05]"
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleStatus(child.id, child.status);
                  }}
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    child.status === 'done'
                      ? 'border-nexus-emerald bg-nexus-emerald/25 text-nexus-emerald'
                      : 'border-white/20 text-transparent hover:border-nexus-cyan/60',
                  )}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[11.5px]',
                    child.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200',
                  )}
                >
                  {child.title}
                </span>
                <span className="font-mono text-[9px] text-slate-600">{child.progress}%</span>
              </button>
            </li>
          ))}
          {children.length === 0 ? (
            <li className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-slate-600">
              No child tasks — this is a leaf deliverable.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="rounded-xl border border-nexus-violet/25 bg-nexus-violet/[0.07] p-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-nexus-violet" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-nexus-violet">
            AI subtask generator
          </p>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
          Draft an execution breakdown for this task. The generator expands the title and notes into
          sequenced site subtasks you can promote into the graph.
        </p>
        <button
          onClick={() => dispatch({ type: 'select-task', taskId: task.id })}
          className="btn btn-violet mt-2 h-7 px-2.5 text-[10px]"
        >
          Open AI Insights tab
        </button>
      </section>
    </div>
  );
}
