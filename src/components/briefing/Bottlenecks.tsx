'use client';

import { useMemo } from 'react';
import { useNexus } from '@/lib/store';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, CircleDashed, MessageCircle } from 'lucide-react';
import type { Task } from '@/types/nexus';

const WA: Record<string, { name: string; phone: string }> = {
  Civil: { name: 'Site foreman', phone: '94771234567' },
  Health: { name: 'Physician', phone: '94112345678' },
  Finance: { name: 'Bank advisor', phone: '94113456789' },
};

export function Bottlenecks() {
  const { state, updateTask, progress } = useNexus();

  const open = useMemo(() => {
    const leaves = state.tasks.filter((t) => !progress.get(t.id)?.children.length && t.status !== 'done');
    const weight = { high: 0, medium: 1, low: 2 } as const;
    return leaves.sort((a, b) => weight[a.priority] - weight[b.priority]).slice(0, 6);
  }, [state.tasks, progress]);

  const cycle = (t: Task) => updateTask(t.id, { status: t.status === 'todo' ? 'doing' : t.status === 'doing' ? 'done' : 'todo' });
  const rootCivil = progress.get('civ-root')?.progress ?? 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Civil Works programme progress (bottom-up rollup)</span>
          <span className="font-semibold text-slate-200">{rootCivil}%</span>
        </div>
        <ProgressBar value={rootCivil} />
      </div>

      <ul className="space-y-2">
        {open.map((t) => {
          const Icon = t.status === 'doing' ? CircleDashed : Circle;
          return (
            <li key={t.id}>
              <button onClick={() => cycle(t)} className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-cyan-400/30 hover:bg-white/[0.06]">
                <Icon className={cn('h-4.5 w-4.5 shrink-0', t.status === 'doing' ? 'text-amber-300' : 'text-slate-500')} />
                <span className="flex-1 text-sm">{t.title}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide', t.priority === 'high' ? 'bg-pink-500/20 text-pink-300' : t.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-500/20 text-slate-300')}>{t.priority}</span>
              </button>
            </li>
          );
        })}
        {open.length === 0 && <li className="flex items-center gap-2 text-sm text-lime-300"><CheckCircle2 className="h-4 w-4" /> No open bottlenecks.</li>}
      </ul>

      <div>
        <p className="label">WhatsApp dispatch</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(WA).map(([group, c]) => (
            <a key={group} target="_blank" rel="noopener noreferrer" href={`https://wa.me/${c.phone}?text=${encodeURIComponent(`[NEXUS] ${group} update — please confirm status.`)}`} className="btn-ghost text-xs">
              <MessageCircle className="h-3.5 w-3.5 text-lime-300" /> {c.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
