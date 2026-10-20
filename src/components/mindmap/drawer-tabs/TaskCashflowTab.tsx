'use client';

import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { useNexus } from '@/store/nexus-store';
import { formatCurrency } from '@/lib/parser/utils';

/** Embedded micro-cashflow ledger tab — estimated vs actual vs committed. */
export function TaskCashflowTab({ task }: { task: MindMapTaskNode }) {
  const { state } = useNexus();
  const linked = state.transactions.filter((t) => t.linkedTaskId === task.id);
  const cashflow = task.cashflow;

  const estimated = cashflow?.estimatedCost ?? 0;
  const actual = cashflow?.actualSpend ?? 0;
  const committed = cashflow?.committed ?? 0;
  const variance = estimated - actual;
  const consumed = estimated > 0 ? Math.min(100, (actual / estimated) * 100) : 0;

  return (
    <div className="space-y-4">
      <section className="glass-soft p-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-3.5 w-3.5 text-nexus-amber" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-nexus-amber">
            Micro cashflow ledger
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {[
            { label: 'Estimated cost', value: estimated, tone: 'text-slate-200' },
            { label: 'Actual spend', value: actual, tone: 'text-nexus-amber' },
            { label: 'Committed (PO issued)', value: committed, tone: 'text-nexus-violet' },
            { label: 'Remaining variance', value: variance, tone: variance >= 0 ? 'text-nexus-emerald' : 'text-nexus-rose' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">{row.label}</span>
              <span className={`font-mono ${row.tone}`}>
                {formatCurrency(row.value, state.currency, { compact: true })}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-nexus-cyan to-nexus-amber"
              style={{ width: `${consumed}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-slate-600">
            {Math.round(consumed)}% of the estimated envelope consumed
          </p>
        </div>
      </section>

      <section>
        <p className="label-caps mb-2">Ledger entries ({linked.length})</p>
        {linked.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-slate-600">
            No transactions are linked to this task yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {linked.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
              >
                {tx.type === 'income' ? (
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-nexus-emerald" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 shrink-0 text-nexus-rose" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] text-slate-300">{tx.title}</p>
                  <p className="font-mono text-[9px] text-slate-600">
                    {tx.date} · {tx.bucket} · {tx.status}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-slate-200">
                  {formatCurrency(tx.amount, tx.currency, { compact: true })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
