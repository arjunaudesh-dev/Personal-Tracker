'use client';

import { Coffee, Plus, Receipt, ListPlus } from 'lucide-react';
import { useState } from 'react';

import { useNexus } from '@/store/nexus-store';
import { uid } from '@/lib/parser/utils';

type CaptureKind = 'expense' | 'subtask' | 'meal';

const TABS: Array<{ id: CaptureKind; label: string; icon: typeof Plus; tone: string }> = [
  { id: 'expense', label: 'Expense', icon: Receipt, tone: 'text-nexus-amber' },
  { id: 'subtask', label: 'Sub-Task', icon: ListPlus, tone: 'text-nexus-cyan' },
  { id: 'meal', label: 'Meal', icon: Coffee, tone: 'text-nexus-emerald' },
];

/** Three-second quick capture — expense, sub-task or meal in one line. */
export function QuickCaptureBar() {
  const { state, dispatch } = useNexus();
  const [kind, setKind] = useState<CaptureKind>('expense');
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = () => {
    const text = value.trim();
    if (!text) return;

    if (kind === 'expense') {
      const amount = Number(text.replace(/[^0-9.]/g, '')) || 0;
      dispatch({
        type: 'add-transaction',
        transaction: {
          id: uid('tx'),
          date: new Date().toISOString().slice(0, 10),
          amount,
          currency: state.currency,
          title: text,
          category: 'Quick capture',
          bucket: 'needs',
          type: 'expense',
          linkedTaskId: null,
          status: 'settled',
          createdAt: new Date().toISOString(),
        },
      });
    } else if (kind === 'subtask') {
      const parent = state.tasks.find((t) => t.depth === 1 && t.groupCategory === 'Work');
      dispatch({
        type: 'add-task',
        task: {
          id: uid('task'),
          parentId: parent?.id ?? null,
          boardId: parent?.boardId ?? 'master',
          title: text,
          markdownNotes: 'Captured from the briefing quick-capture bar.',
          groupCategory: parent?.groupCategory ?? 'Work',
          direction: 'LR',
          depth: (parent?.depth ?? 0) + 1,
          posX: 0,
          posY: 0,
          status: 'todo',
          priority: 'medium',
          tags: ['quick-capture'],
          isCollapsed: false,
          progress: 0,
          isAutoCalculated: false,
          cashflow: null,
          reminders: [],
          attachments: [],
          contacts: [],
          aiInsight: null,
          dueDate: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      const calories = Number(text.replace(/[^0-9.]/g, '')) || 0;
      dispatch({
        type: 'log-meal',
        meal: {
          id: uid('meal'),
          date: new Date().toISOString().slice(0, 10),
          slot: 'snack',
          name: text,
          protein: Math.round(calories * 0.08),
          carbs: Math.round(calories * 0.18),
          fat: Math.round(calories * 0.07),
          calories: Math.round(calories),
        },
      });
    }

    setValue('');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="rounded-xl border border-white/[0.07] bg-ink-900/60 p-2.5">
      <div className="flex items-center gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = kind === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setKind(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10.5px] font-medium transition-colors ${
                active ? `bg-white/[0.08] ${tab.tone}` : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="h-3 w-3" />
              + {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={
            kind === 'expense'
              ? 'e.g. 480 grout delivery'
              : kind === 'subtask'
                ? 'e.g. Collect mill certificates'
                : 'e.g. 320 kcal whey shake'
          }
          className="input"
        />
        <button onClick={submit} className="btn btn-primary shrink-0">
          {saved ? 'Saved' : 'Capture'}
        </button>
      </div>
    </div>
  );
}
