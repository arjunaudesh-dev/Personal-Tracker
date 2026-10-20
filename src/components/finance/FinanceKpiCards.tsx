import React from 'react';
import { TrendingUp, Flame, PiggyBank, Briefcase, RefreshCw } from 'lucide-react';
import { FinanceKpis, CurrencyCode } from '@/types/finance';
import { formatCurrency } from '@/lib/utils';

interface FinanceKpiCardsProps {
  kpis: FinanceKpis;
  currency: CurrencyCode;
  onToggleCurrency: () => void;
}

export function FinanceKpiCards({
  kpis,
  currency,
  onToggleCurrency,
}: FinanceKpiCardsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-400 font-mono uppercase tracking-wider">
            Capital Velocity & Cashflow Command
          </h2>
          <p className="text-xs text-slate-500">
            Real-time balance, burn rate, and committed engineering allocations
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleCurrency}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-xs font-bold hover:bg-sky-500/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Currency: {currency} (308 LKR/$)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Net Cashflow */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Net Monthly Inflow</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            +{formatCurrency(kpis.netCashflow, currency)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Total Liquid: {formatCurrency(kpis.totalLiquidCapital, currency)}
          </div>
        </div>

        {/* Daily Burn Rate */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Daily Burn Velocity</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {formatCurrency(kpis.dailyBurnRate, currency)} / day
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Calibrated monthly spend: {formatCurrency(kpis.monthlySpend, currency)}
          </div>
        </div>

        {/* 50/30/20 Savings Adherence */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Savings & Sinking Rate</span>
            <PiggyBank className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {kpis.savingsRate.toFixed(1)}%
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono">
            Target: 20% (Met +{(kpis.savingsRate - 20).toFixed(1)}%)
          </div>
        </div>

        {/* Committed BOQ Task Spend */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Committed Task Spend</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300">
            {formatCurrency(kpis.committedTaskSpend, currency)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Aggregated from Mind-Map BOQ Nodes
          </div>
        </div>
      </div>
    </div>
  );
}
