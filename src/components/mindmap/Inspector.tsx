'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { Task, TaskStatus, Priority, BoqItem, Group } from '@/types/nexus';
import { useNexus } from '@/lib/store';
import { boqTotal } from '@/lib/rollup';
import { cn, formatMoney, uid } from '@/lib/utils';

const GROUPS: Group[] = ['Civil', 'Health', 'Finance', 'Personal'];

export function Inspector({ task, onClose }: { task: Task; onClose: () => void }) {
  const { updateTask, addTask, deleteTask, progress, state } = useNexus();
  const [childTitle, setChildTitle] = useState('');
  const total = boqTotal(task);
  const p = progress.get(task.id)?.progress ?? 0;
  const linked = state.transactions.filter((t) => t.linkedTaskId === task.id);

  const setBoq = (boq: BoqItem[]) => updateTask(task.id, { boq });
  const patchBoq = (id: string, patch: Partial<BoqItem>) => setBoq(task.boq.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  return (
    <aside className="glass flex max-h-[calc(100vh-10rem)] flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Inspector · {task.group}</p>
          <input className="mt-1 w-full bg-transparent text-lg font-semibold outline-none" value={task.title} onChange={(e) => updateTask(task.id, { title: e.target.value })} aria-label="Task title" />
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10" aria-label="Close inspector"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="ins-status">Status</label>
            <select id="ins-status" className="input" value={task.status} onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}>
              <option value="todo">To do</option><option value="doing">In progress</option><option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ins-prio">Priority</label>
            <select id="ins-prio" className="input" value={task.priority} onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ins-group">Group</label>
            <select id="ins-group" className="input" value={task.group} onChange={(e) => updateTask(task.id, { group: e.target.value as Group })}>
              {GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ins-due">Due</label>
            <input id="ins-due" type="date" className="input" value={task.dueDate ?? ''} onChange={(e) => updateTask(task.id, { dueDate: e.target.value || null })} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-400"><span>Branch progress (rollup)</span><span className="text-slate-200">{p}%</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all" style={{ width: `${p}%` }} /></div>
        </div>

        <div>
          <label className="label" htmlFor="ins-notes">Notes</label>
          <textarea id="ins-notes" rows={3} className="input" value={task.notes} onChange={(e) => updateTask(task.id, { notes: e.target.value })} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="label !mb-0">Bill of quantities</p>
            <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => setBoq([...task.boq, { id: uid('boq'), item: 'New item', qty: 1, rate: 0 }])}><Plus className="h-3 w-3" /> Item</button>
          </div>
          <div className="space-y-2">
            {task.boq.map((b) => (
              <div key={b.id} className="grid grid-cols-[1fr_52px_64px_28px] items-center gap-1.5">
                <input className="input !py-1.5 text-xs" value={b.item} onChange={(e) => patchBoq(b.id, { item: e.target.value })} aria-label="Item" />
                <input className="input !py-1.5 text-xs" type="number" min={0} value={b.qty} onChange={(e) => patchBoq(b.id, { qty: Number(e.target.value) })} aria-label="Quantity" />
                <input className="input !py-1.5 text-xs" type="number" min={0} value={b.rate} onChange={(e) => patchBoq(b.id, { rate: Number(e.target.value) })} aria-label="Rate USD" />
                <button className="grid place-items-center text-slate-500 hover:text-pink-300" onClick={() => setBoq(task.boq.filter((x) => x.id !== b.id))} aria-label="Remove item"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            {task.boq.length === 0 && <p className="text-xs text-slate-500">No BOQ lines yet.</p>}
          </div>
          <div className="mt-3 flex justify-between rounded-xl bg-violet-500/10 px-3 py-2 text-sm">
            <span className="text-slate-300">Total (qty × rate)</span>
            <span className="font-semibold">{formatMoney(total)}</span>
          </div>
          {linked.length > 0 && <p className="mt-2 text-[11px] text-slate-500">Linked ledger spend: {formatMoney(linked.reduce((s, t) => s + t.amount, 0))}</p>}
        </div>

        <div>
          <p className="label">Add sub-task</p>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (childTitle.trim()) { addTask({ title: childTitle.trim(), parentId: task.id, group: task.group }); setChildTitle(''); } }}>
            <input className="input" placeholder="e.g. Procure rip-rap quarry quote" value={childTitle} onChange={(e) => setChildTitle(e.target.value)} />
            <button className="btn-primary !px-3" type="submit" aria-label="Add sub-task"><Plus className="h-4 w-4" /></button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <button className={cn('btn w-full justify-center border border-pink-400/30 bg-pink-500/10 text-pink-200 hover:bg-pink-500/20')} onClick={() => { if (window.confirm(`Delete "${task.title}" and all sub-tasks?`)) { deleteTask(task.id); onClose(); } }}>
          <Trash2 className="h-4 w-4" /> Delete branch
        </button>
      </div>
    </aside>
  );
}
