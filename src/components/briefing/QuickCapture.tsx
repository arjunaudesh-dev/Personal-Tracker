'use client';

import { useState } from 'react';
import { Receipt, ListPlus, Utensils, Plus } from 'lucide-react';
import { useNexus } from '@/lib/store';
import { todayISO, cn } from '@/lib/utils';
import type { Group } from '@/types/nexus';

type Mode = 'expense' | 'subtask' | 'meal';

export function QuickCapture() {
  const { addTransaction, addTask, addMeal, state } = useNexus();
  const [mode, setMode] = useState<Mode>('expense');
  const [text, setText] = useState('');
  const [num, setNum] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(num);
    if (!text.trim()) return;
    if (mode === 'expense') {
      if (!(value > 0)) return;
      addTransaction({ date: todayISO(), title: text.trim(), amount: value, type: 'expense', bucket: 'wants', category: 'Quick', linkedTaskId: null });
    } else if (mode === 'subtask') {
      const parent = state.tasks.find((t) => t.parentId === null && t.group === 'Civil') ?? state.tasks[0];
      addTask({ title: text.trim(), parentId: parent?.id ?? null, group: (parent?.group ?? 'Personal') as Group, priority: 'medium' });
    } else {
      if (!(value >= 0)) return;
      addMeal({ date: todayISO(), name: text.trim(), calories: value, protein: 0 });
    }
    setFlash(mode === 'expense' ? 'Expense logged' : mode === 'subtask' ? 'Sub-task added to Civil' : 'Meal logged');
    setText('');
    setNum('');
    setTimeout(() => setFlash(null), 2000);
  };

  const tabs: { id: Mode; label: string; icon: typeof Receipt }[] = [
    { id: 'expense', label: '+ Expense', icon: Receipt },
    { id: 'subtask', label: '+ Sub-Task', icon: ListPlus },
    { id: 'meal', label: '+ Meal', icon: Utensils },
  ];

  return (
    <form onSubmit={submit} className="glass flex flex-col gap-3 p-3 md:flex-row md:items-center">
      <div className="flex gap-1 rounded-xl bg-slate-900/60 p-1">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setMode(t.id)} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition', mode === t.id ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950' : 'text-slate-400 hover:text-slate-200')}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>
      <input className="input md:flex-1" placeholder={mode === 'meal' ? 'What did you eat?' : mode === 'subtask' ? 'New sub-task under Civil…' : 'What did you spend on?'} value={text} onChange={(e) => setText(e.target.value)} />
      {mode !== 'subtask' && (
        <input className="input md:w-32" type="number" min={0} step="any" placeholder={mode === 'meal' ? 'kcal' : 'USD'} value={num} onChange={(e) => setNum(e.target.value)} />
      )}
      <button className="btn-primary justify-center" type="submit"><Plus className="h-4 w-4" /> Capture</button>
      {flash && <span className="text-xs text-lime-300 md:ml-2">✓ {flash}</span>}
    </form>
  );
}
