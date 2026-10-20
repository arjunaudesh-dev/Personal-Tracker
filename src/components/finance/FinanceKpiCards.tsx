'use client';

import { ArrowDownRight, ArrowUpRight, Flame, PiggyBank, Wallet } from 'lucide-react';

import type { FinancialTransaction, MindMapTaskNode } from '@/lib/types/nexus';
import { formatCurrency } from '@/lib/parser/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/Progress';

export function FinanceKpiCards({
  transactions,
  tasks,
  currency,
}: {
  transactions: FinancialTransaction[];
  tasks: MindMapTaskNode[];
  currency: 'USD' | 'LKR';
}) {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const monthTx = transactions.filter((t) => t.date.startsWith(month));
  const income = monthTx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const net = income - expense;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;

  const last30 = transactions.filter(
    (t) => t.type === 'expense' && t.date >= new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
  );
  const burn = last30.reduce((a, t) => a + t.amount, 0) / 30;
  const committed = tasks.reduce((a, t) => a + (t.cashflow?.committed ?? 0), 0);
  const actual = tasks.reduce((a, t) => a + (t.cashflow?.actualSpend ?? 0), 0);

  const cards = [
    {
      label: 'Net cashflow',
      value: formatCurrency(net, currency, { compact: true }),
      sub: `${formatCurrency(income, currency, { compact: true })} in · ${formatCurrency(expense, currency, { compact: true })} out`,
      icon: net >= 0 ? ArrowUpRight : ArrowDownRight,
      tone: net >= 0 ? 'text-nexus-emerald' : 'text-nexus-rose',
      glow: net >= 0 ? ('emerald' as const) : ('rose' as const),
    },
    {
      label: 'Daily burn rate',
      value: formatCurrency(burn, currency, { compact: true }),
      sub: 'Trailing 30-day average',
      icon: Flame,
      tone: 'text-nexus-amber',
      glow: 'amber' as const,
    },
    {
      label: 'Savings rate',
      value: `${savingsRate.toFixed(1)}%`,
      sub: 'Target 20% · 50/30/20 discipline',
      icon: PiggyBank,
      tone: savingsRate >= 20 ? 'text-nexus-emerald' : 'text-nexus-rose',
      glow: savingsRate >= 20 ? ('emerald' as const) : ('rose' as const),
    },
    {
      label: 'BOQ committed',
      value: formatCurrency(committed, currency, { compact: true }),
      sub: `${formatCurrency(actual, currency, { compact: true })} disbursed to date`,
      icon: Wallet,
      tone: 'text-nexus-violet',
      glow: 'violet' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <GlassCard key={card.label} glow={card.glow} delay={i * 0.05} className="p-4">
            <div className="flex items-start justify-between">
              <p className="label-caps">{card.label}</p>
              <Icon className={`h-4 w-4 ${card.tone}`} />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-slate-100">
              {card.value}
            </p>
            <p className="mt-1 text-[10.5px] text-slate-500">{card.sub}</p>
            {card.label === 'Savings rate' ? (
              <ProgressBar
                value={Math.min(100, savingsRate)}
                tone={savingsRate >= 20 ? 'emerald' : 'rose'}
                className="mt-2.5"
                height={4}
              />
            ) : null}
          </GlassCard>
        );
      })}
    </div>
  );
}
