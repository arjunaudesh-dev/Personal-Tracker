'use client';

import { useNexus } from '@/lib/store';
import { cn } from '@/lib/utils';

export function CurrencyToggle() {
  const { state, setCurrency } = useNexus();
  return (
    <div role="group" aria-label="Display currency" className="inline-flex rounded-xl border border-white/10 bg-slate-900/60 p-1 text-xs">
      {(['USD', 'LKR'] as const).map((c) => (
        <button key={c} type="button" aria-pressed={state.currency === c} onClick={() => setCurrency(c)} className={cn('rounded-lg px-3 py-1.5 font-semibold transition', state.currency === c ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950' : 'text-slate-400 hover:text-slate-200')}>
          {c}
        </button>
      ))}
    </div>
  );
}
