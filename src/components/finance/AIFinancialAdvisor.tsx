'use client';

import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

import type { AdvisorDirective, FinancialTransaction, MindMapTaskNode } from '@/lib/types/nexus';
import { formatCurrency } from '@/lib/parser/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { useNexus } from '@/store/nexus-store';

const SEVERITY: Record<string, string> = {
  high: 'border-nexus-rose/40 bg-nexus-rose/[0.08] text-nexus-rose',
  medium: 'border-nexus-amber/40 bg-nexus-amber/[0.08] text-nexus-amber',
  low: 'border-nexus-emerald/40 bg-nexus-emerald/[0.08] text-nexus-emerald',
};

/** Gemini-backed financial advisor with a deterministic offline fallback. */
export function AIFinancialAdvisor({
  transactions,
  tasks,
}: {
  transactions: FinancialTransaction[];
  tasks: MindMapTaskNode[];
}) {
  const { state } = useNexus();
  const [directives, setDirectives] = useState<AdvisorDirective[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('');
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const month = new Date().toISOString().slice(0, 7);
      const monthTx = transactions.filter((t) => t.date.startsWith(month));
      const income = monthTx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
      const expense = monthTx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
      const breakdown = ['needs', 'wants', 'savings'].map((bucket) => ({
        bucket,
        actual: monthTx.filter((t) => t.bucket === bucket && t.type === 'expense').reduce((a, t) => a + t.amount, 0),
        planned: income * (bucket === 'needs' ? 0.5 : bucket === 'wants' ? 0.3 : 0.2),
      }));
      const burnRate = expense / Math.max(1, new Date().getDate());
      const committedSpend = tasks.reduce((a, t) => a + (t.cashflow?.committed ?? 0), 0);

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'financial-advice',
          payload: {
            monthlyIncome: income,
            monthlyExpense: expense,
            breakdown,
            burnRate,
            committedSpend,
            currency: state.currency,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Advisor unavailable');
      setDirectives(json.data?.directives ?? []);
      setSource(json.source ?? 'local');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Advisor unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-4" glow="violet">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps">Advisory</p>
          <h3 className="text-sm font-semibold tracking-tight text-slate-100">AI financial advisor</h3>
          <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
            Serialises monthly cashflow KPIs, the daily burn rate and pending task expenditures
            into actionable budget directives.
          </p>
        </div>
        <Sparkles className="h-4 w-4 shrink-0 text-nexus-violet" />
      </div>

      <button onClick={run} disabled={loading} className="btn btn-violet mt-3">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {loading ? 'Analysing…' : 'Generate directives'}
      </button>

      {error ? <p className="mt-2 text-[10.5px] text-nexus-rose">{error}</p> : null}
      {source ? <p className="mt-2 font-mono text-[9px] text-slate-600">engine: {source}</p> : null}

      <div className="mt-3 space-y-2">
        {directives.map((d, i) => (
          <div key={i} className={`rounded-xl border p-3 ${SEVERITY[d.severity]}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold">{d.title}</p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-slate-300/90">{d.detail}</p>
              </div>
              {d.impact > 0 ? (
                <span className="shrink-0 font-mono text-[10px] opacity-80">
                  {formatCurrency(d.impact, state.currency, { compact: true })}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
