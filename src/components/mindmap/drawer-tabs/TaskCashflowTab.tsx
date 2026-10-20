import React from 'react';
import { DollarSign, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { MindMapTaskNode } from '@/types/mindmap';
import { formatCurrency } from '@/lib/utils';

interface TaskCashflowTabProps {
  task: MindMapTaskNode;
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
}

export function TaskCashflowTab({ task, onUpdate }: TaskCashflowTabProps) {
  const cashflow = task.cashflow || {
    estimatedCost: 0,
    actualSpend: 0,
    currency: 'USD',
  };

  const variance = cashflow.estimatedCost - cashflow.actualSpend;
  const isOverBudget = variance < 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-850 p-3 rounded-lg border border-white/5">
          <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">
            Committed Budget
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-300">$</span>
            <input
              type="number"
              value={cashflow.estimatedCost || ''}
              onChange={(e) =>
                onUpdate({
                  cashflow: { ...cashflow, estimatedCost: Number(e.target.value) },
                })
              }
              className="w-full bg-slate-800 text-white font-bold font-mono rounded px-2 py-1 text-sm border border-white/10"
            />
          </div>
        </div>

        <div className="bg-slate-850 p-3 rounded-lg border border-white/5">
          <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">
            Actual Disbursed
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-300">$</span>
            <input
              type="number"
              value={cashflow.actualSpend || ''}
              onChange={(e) =>
                onUpdate({
                  cashflow: { ...cashflow, actualSpend: Number(e.target.value) },
                })
              }
              className="w-full bg-slate-800 text-amber-400 font-bold font-mono rounded px-2 py-1 text-sm border border-white/10"
            />
          </div>
        </div>
      </div>

      <div
        className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono ${
          isOverBudget
            ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold">
          {isOverBudget ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          )}
          <span>{isOverBudget ? 'Budget Overrun' : 'Remaining Allocation'}</span>
        </div>
        <span className="text-sm font-bold">
          {formatCurrency(Math.abs(variance), cashflow.currency)}
        </span>
      </div>

      <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-white/5">
        Any disbursements made here are automatically accounted in the master Cashflow Waterfall and Committed Spend analytics in the Financial Command Center.
      </div>
    </div>
  );
}
