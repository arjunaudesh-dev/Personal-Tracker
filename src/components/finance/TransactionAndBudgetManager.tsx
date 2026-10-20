import React, { useState } from 'react';
import { Plus, Search, Trash2, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { FinancialTransaction, CurrencyCode, BudgetBucket } from '@/types/finance';
import { formatCurrency } from '@/lib/utils';

interface TransactionAndBudgetManagerProps {
  transactions: FinancialTransaction[];
  currency: CurrencyCode;
  onOpenModal: () => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionAndBudgetManager({
  transactions,
  currency,
  onOpenModal,
  onDeleteTransaction,
}: TransactionAndBudgetManagerProps) {
  const [filterBucket, setFilterBucket] = useState<BudgetBucket | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter((t) => {
    const matchBucket = filterBucket === 'all' || t.bucket === filterBucket;
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchBucket && matchSearch;
  });

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Operational Ledger & Sinking Allocations
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {filtered.length} entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search ledger..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 text-white pl-8 pr-2 py-1.5 rounded-lg border border-white/10 text-xs w-36 sm:w-44 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Bucket filter */}
          <select
            value={filterBucket}
            onChange={(e) => setFilterBucket(e.target.value as any)}
            className="bg-slate-800 text-slate-200 border border-white/10 rounded-lg px-2 py-1.5 text-xs"
          >
            <option value="all">All Buckets</option>
            <option value="needs">Needs (50%)</option>
            <option value="wants">Wants (30%)</option>
            <option value="savings">Savings (20%)</option>
          </select>

          <button
            type="button"
            onClick={onOpenModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Transaction
          </button>
        </div>
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 font-mono uppercase text-[10px]">
            <tr>
              <th className="p-2.5">Date</th>
              <th className="p-2.5">Title & Category</th>
              <th className="p-2.5 text-center">Bucket</th>
              <th className="p-2.5 text-right">Amount</th>
              <th className="p-2.5 text-center">Status</th>
              <th className="p-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-900/40">
            {filtered.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-2.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="p-2.5">
                    <div className="font-semibold text-white">{t.title}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800">{t.category}</span>
                      {t.linkedTaskId && (
                        <span className="text-sky-400 font-mono text-[9px]">Linked to Mind-Map</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2.5 text-center">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        t.bucket === 'needs'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : t.bucket === 'wants'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}
                    >
                      {t.bucket}
                    </span>
                  </td>
                  <td
                    className={`p-2.5 text-right font-mono font-bold whitespace-nowrap ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(t.amount, currency)}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Settled
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(t.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
