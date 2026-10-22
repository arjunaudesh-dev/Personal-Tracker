'use client';

import { useMemo } from 'react';
import { Trash2, TrendingUp, TrendingDown, PiggyBank, Landmark } from 'lucide-react';
import { useNexus } from '@/lib/store';
import { useCurrencyLabel } from '@/lib/currency';
import { summarizeBudget } from '@/lib/budget';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { PageHeader } from '@/components/ui/PageHeader';
import { CurrencyToggle } from '@/components/ui/CurrencyToggle';
import { CashflowArea, BucketDonut, PlannedVsActual } from './FinanceCharts';
import { TransactionForm } from './TransactionForm';
import { cn } from '@/lib/utils';

export function FinanceView() {
  const { state, deleteTransaction, setMonthlyIncome } = useNexus();
  const { label } = useCurrencyLabel();

  const { income, expense, summary } = useMemo(() => {
    const income = state.transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) || state.monthlyIncome;
    const expense = state.transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, summary: summarizeBudget(state.transactions, state.monthlyIncome) };
  }, [state.transactions, state.monthlyIncome]);

  const net = income - expense;
  const savingsRate = income ? Math.round((net / income) * 1000) / 10 : 0;

  return (
    <>
      <PageHeader
        eyebrow="Module B · Financial & budget command"
        title="Finance"
        description="50 / 30 / 20 discipline, linked spend from your Mind-Map and dual currency at 308 LKR per USD."
        actions={<CurrencyToggle />}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi label="Net cash-flow" value={label(net)} sub="Income − expenses" icon={net >= 0 ? TrendingUp : TrendingDown} tone={net >= 0 ? 'lime' : 'pink'} />
        <Kpi label="Savings rate" value={`${savingsRate}%`} sub="Target ≥ 20%" icon={PiggyBank} tone="violet" />
        <Kpi label="Total expenses" value={label(expense)} sub={`${state.transactions.filter((t) => t.type === 'expense').length} entries`} icon={Landmark} tone="amber" />
        <label className="glass flex flex-col justify-between p-5">
          <span className="label !mb-0">Monthly income (USD)</span>
          <input type="number" min={0} className="input mt-3 text-lg font-semibold" value={state.monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)} />
          <span className="mt-2 text-xs text-slate-500">Drives the 50/30/20 allowances</span>
        </label>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card title="Cash-flow waterfall" subtitle="Cumulative net position across the billing cycle" className="xl:col-span-7"><CashflowArea /></Card>
        <Card title="50 / 30 / 20 adherence" subtitle="Target rings vs actual spend" className="xl:col-span-5"><BucketDonut summary={summary} /></Card>
        <Card title="Planned vs actual by category" subtitle="Variance across engineering, career and personal buckets" className="xl:col-span-12"><PlannedVsActual /></Card>

        <Card title="Add transaction" className="xl:col-span-12"><TransactionForm /></Card>

        <Card title="Ledger" subtitle="Most recent first" className="xl:col-span-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr><th className="py-2 font-medium">Date</th><th className="font-medium">Description</th><th className="font-medium">Bucket</th><th className="font-medium">Task</th><th className="text-right font-medium">Amount</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.03]">
                    <td className="py-2.5 font-mono text-xs text-slate-400">{t.date}</td>
                    <td>{t.title} <span className="text-xs text-slate-500">· {t.category}</span></td>
                    <td><span className={cn('rounded-full px-2 py-0.5 text-[11px] capitalize', t.bucket === 'needs' ? 'bg-cyan-400/15 text-cyan-200' : t.bucket === 'wants' ? 'bg-violet-400/15 text-violet-200' : 'bg-lime-400/15 text-lime-200')}>{t.bucket}</span></td>
                    <td className="text-xs text-slate-400">{state.tasks.find((x) => x.id === t.linkedTaskId)?.title ?? '—'}</td>
                    <td className={cn('whitespace-nowrap text-right font-semibold tabular-nums', t.type === 'income' ? 'text-lime-300' : 'text-slate-100')}>{t.type === 'income' ? '+' : '−'}{label(t.amount)}</td>
                    <td className="text-right"><button aria-label="Delete transaction" onClick={() => deleteTransaction(t.id)} className="rounded-md p-1.5 text-slate-500 hover:bg-pink-500/10 hover:text-pink-300"><Trash2 className="h-3.5 w-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
