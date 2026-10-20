'use client';

import { useMemo } from 'react';

import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';
import { useNexus } from '@/store/nexus-store';
import {
  budgetBreakdown,
  cashflowSeries,
  dailyOutflow,
} from '@/store/nexus-selectors';
import { buildCategoryVariance } from '@/components/finance/mock-finance-data';
import { BarSeries } from '@/components/ui/Sparkline';

import { AIFinancialAdvisor } from './AIFinancialAdvisor';
import { BudgetAllocationPanel, TransactionAndBudgetManager } from './TransactionAndBudgetManager';
import {
  BudgetDonutChart,
  CashflowWaterfall,
  CategoryVarianceChart,
} from './FinanceCharts';
import { FinanceKpiCards } from './FinanceKpiCards';

/** Module B — Financial & Budget Command Center. */
export function FinanceDashboard() {
  const { state } = useNexus();

  const breakdown = useMemo(() => budgetBreakdown(state.transactions), [state.transactions]);
  const series = useMemo(() => cashflowSeries(state.transactions), [state.transactions]);
  const outflow = useMemo(() => dailyOutflow(state.transactions, 7), [state.transactions]);
  const variance = useMemo(
    () => buildCategoryVariance(state.transactions),
    [state.transactions],
  );

  const outflowMax = Math.max(...outflow.map((o) => o.amount), 1);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <FinanceKpiCards transactions={state.transactions} tasks={state.tasks} currency={state.currency} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassCard className="p-4" glow="cyan">
          <SectionHeader eyebrow="Allocation" title="Needs · Wants · Savings" />
          <BudgetDonutChart breakdown={breakdown} currency={state.currency} />
        </GlassCard>

        <GlassCard className="p-4" glow="violet">
          <SectionHeader eyebrow="Trailing 8 weeks" title="Cashflow waterfall" />
          <CashflowWaterfall series={series} currency={state.currency} />
        </GlassCard>

        <GlassCard className="p-4" glow="amber">
          <SectionHeader eyebrow="7-day velocity" title="Outflow velocity" />
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="font-mono text-2xl font-semibold text-slate-100">
                ${outflow.reduce((a, o) => a + o.amount, 0).toFixed(0)}
              </p>
              <p className="text-[10px] text-slate-500">total 7-day outflow</p>
            </div>
            <span className="chip border-nexus-amber/30 bg-nexus-amber/10 text-nexus-amber">
              peak ${outflowMax.toFixed(0)}
            </span>
          </div>
          <BarSeries data={outflow.map((o) => o.amount)} />
          <div className="mt-2 flex justify-between font-mono text-[9px] text-slate-600">
            {outflow.map((o) => (
              <span key={o.day}>{o.day}</span>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassCard className="p-4 xl:col-span-2" glow="emerald">
          <SectionHeader eyebrow="Variance" title="Category planned vs actual" />
          <CategoryVarianceChart variance={variance} currency={state.currency} />
        </GlassCard>

        <BudgetAllocationPanel breakdown={breakdown} currency={state.currency} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TransactionAndBudgetManager />
        </div>
        <AIFinancialAdvisor transactions={state.transactions} tasks={state.tasks} />
      </div>
    </div>
  );
}
