import type { Bucket, Transaction } from '@/types/nexus';

export const BUCKET_TARGETS: Record<Bucket, number> = { needs: 50, wants: 30, savings: 20 };

export interface BucketSummary {
  bucket: Bucket;
  targetPct: number;
  actualPct: number;
  spentUsd: number;
  allowedUsd: number;
}

/** Compares expense spend per bucket against the 50/30/20 framework. Savings are inferred from income minus expenses. */
export function summarizeBudget(txs: Transaction[], monthlyIncome: number): BucketSummary[] {
  const expenses = txs.filter((t) => t.type === 'expense');
  const spent: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 };
  for (const t of expenses) spent[t.bucket] += t.amount;
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const incomeBase = monthlyIncome || 1;
  return (Object.keys(BUCKET_TARGETS) as Bucket[]).map((bucket) => {
    const allowedUsd = (incomeBase * BUCKET_TARGETS[bucket]) / 100;
    const actualPct = bucket === 'savings'
      ? Math.max(0, ((incomeBase - totalExpense) / incomeBase) * 100)
      : (spent[bucket] / incomeBase) * 100;
    return { bucket, targetPct: BUCKET_TARGETS[bucket], actualPct: Math.round(actualPct * 10) / 10, spentUsd: spent[bucket], allowedUsd };
  });
}

/** Cumulative net cash-flow series, sorted by date. */
export function cashflowSeries(txs: Transaction[]) {
  const byDate = new Map<string, number>();
  for (const t of [...txs].sort((a, b) => a.date.localeCompare(b.date))) {
    const delta = t.type === 'income' ? t.amount : -t.amount;
    byDate.set(t.date, (byDate.get(t.date) ?? 0) + delta);
  }
  let running = 0;
  return [...byDate.entries()].map(([date, delta]) => {
    running += delta;
    return { date: date.slice(5), net: Math.round(running * 100) / 100 };
  });
}

/** Planned monthly spend per category (USD) used for the planned-vs-actual chart. */
export const CATEGORY_PLAN: Record<string, number> = {
  Housing: 900, Food: 300, Utilities: 100, Civil: 1000, Fitness: 80, Leisure: 200, Transport: 100, Savings: 400, Quick: 150,
};

export function categoryVariance(txs: Transaction[]) {
  const actual: Record<string, number> = {};
  for (const t of txs) if (t.type === 'expense') actual[t.category] = (actual[t.category] ?? 0) + t.amount;
  const cats = new Set([...Object.keys(CATEGORY_PLAN), ...Object.keys(actual)]);
  return [...cats].map((c) => ({
    category: c,
    planned: CATEGORY_PLAN[c] ?? 0,
    actual: Math.round((actual[c] ?? 0) * 100) / 100,
  })).sort((a, b) => b.actual - a.actual).slice(0, 8);
}
