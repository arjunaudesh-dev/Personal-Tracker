'use client';

import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { FinancialTransaction } from '@/lib/types/nexus';
import { formatCurrency } from '@/lib/parser/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/Progress';
import { useNexus } from '@/store/nexus-store';

import { TransactionModal } from './TransactionModal';

const BUCKET_TONE: Record<string, string> = {
  needs: 'text-nexus-cyan',
  wants: 'text-nexus-violet',
  savings: 'text-nexus-emerald',
};

export function TransactionAndBudgetManager() {
  const { state, dispatch } = useNexus();
  const [query, setQuery] = useState('');
  const [bucketFilter, setBucketFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialTransaction | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.transactions
      .filter((t) => (bucketFilter === 'all' ? true : t.bucket === bucketFilter))
      .filter((t) => (q ? `${t.title} ${t.category}`.toLowerCase().includes(q) : true))
      .slice(0, 60);
  }, [state.transactions, query, bucketFilter]);

  return (
    <GlassCard className="p-4" glow="cyan">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-caps">Ledger</p>
          <h3 className="text-sm font-semibold tracking-tight text-slate-100">
            Transactions &amp; budget control
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter ledger…"
              className="input w-44 py-1.5 pl-8 text-[11px]"
            />
          </div>
          <div className="flex gap-1">
            {['all', 'needs', 'wants', 'savings'].map((b) => (
              <button
                key={b}
                onClick={() => setBucketFilter(b)}
                className={`rounded-lg border px-2 py-1.5 text-[10px] font-medium capitalize transition-colors ${
                  bucketFilter === b
                    ? 'border-nexus-cyan/45 bg-nexus-cyan/12 text-nexus-cyan'
                    : 'border-white/10 bg-white/[0.03] text-slate-500 hover:text-slate-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="btn btn-primary h-8 text-[11px]"
          >
            <Plus className="h-3.5 w-3.5" />
            Transaction
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]">
        <div className="scroll-thin max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 z-10 bg-ink-850/95 text-[9px] uppercase tracking-wider text-slate-500 backdrop-blur">
              <tr>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-2 py-2 font-semibold">Title</th>
                <th className="px-2 py-2 font-semibold">Bucket</th>
                <th className="px-2 py-2 font-semibold">Linked task</th>
                <th className="px-2 py-2 text-right font-semibold">Amount</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-t border-white/[0.05] transition-colors hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[10px] text-slate-500">
                    {tx.date}
                  </td>
                  <td className="max-w-[220px] truncate px-2 py-1.5 text-slate-200">{tx.title}</td>
                  <td className={`px-2 py-1.5 capitalize ${BUCKET_TONE[tx.bucket]}`}>{tx.bucket}</td>
                  <td className="max-w-[150px] truncate px-2 py-1.5 text-[10px] text-slate-500">
                    {tx.linkedTaskId
                      ? (state.tasks.find((t) => t.id === tx.linkedTaskId)?.title ?? tx.linkedTaskId)
                      : '—'}
                  </td>
                  <td
                    className={`whitespace-nowrap px-2 py-1.5 text-right font-mono ${
                      tx.type === 'income' ? 'text-nexus-emerald' : 'text-slate-200'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '−'}
                    {formatCurrency(tx.amount, tx.currency, { compact: true })}
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex justify-end gap-0.5">
                      <button
                        onClick={() => {
                          setEditing(tx);
                          setModalOpen(true);
                        }}
                        className="btn btn-ghost h-6 w-6 p-0"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'remove-transaction', id: tx.id })}
                        className="btn btn-ghost h-6 w-6 p-0 text-slate-600 hover:text-nexus-rose"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[11px] text-slate-600">
                    No transactions match this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </GlassCard>
  );
}

/** 50/30/20 allocation with live variance against the plan. */
export function BudgetAllocationPanel({
  breakdown,
  currency,
}: {
  breakdown: Array<{ bucket: string; actual: number; planned: number; ratio: number; color: string }>;
  currency: 'USD' | 'LKR';
}) {
  return (
    <GlassCard className="p-4" glow="emerald">
      <p className="label-caps">Allocation</p>
      <h3 className="mb-3 text-sm font-semibold tracking-tight text-slate-100">
        50 / 30 / 20 discipline
      </h3>
      <div className="space-y-3.5">
        {breakdown.map((b) => {
          const pct = b.planned > 0 ? (b.actual / b.planned) * 100 : 0;
          const over = pct > 100;
          return (
            <div key={b.bucket}>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-medium capitalize text-slate-300">
                  {b.bucket} <span className="text-slate-600">· {b.ratio}%</span>
                </span>
                <span className={`font-mono ${over ? 'text-nexus-rose' : 'text-slate-400'}`}>
                  {formatCurrency(b.actual, currency, { compact: true })} /{' '}
                  {formatCurrency(b.planned, currency, { compact: true })}
                </span>
              </div>
              <ProgressBar value={Math.min(100, pct)} tone={over ? 'rose' : 'emerald'} height={5} />
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
