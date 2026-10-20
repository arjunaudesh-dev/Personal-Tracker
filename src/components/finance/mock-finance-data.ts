import type {
  BudgetPlan,
  CategoryVariance,
  FinancialTransaction,
} from '@/lib/types/finance';

import { addDays, isoDate, seeded, uid } from '@/lib/parser/utils';

export const BUDGET_PLAN: BudgetPlan[] = [
  {
    bucket: 'needs',
    label: 'Needs',
    ratio: 50,
    color: '#22d3ee',
    description: 'Core operational overhead, site utilities, essential materials, basic living.',
  },
  {
    bucket: 'wants',
    label: 'Wants',
    ratio: 30,
    color: '#a78bfa',
    description: 'Equipment upgrades, tactical recreation, discretionary projects.',
  },
  {
    bucket: 'savings',
    label: 'Savings & Sinking',
    ratio: 20,
    color: '#34d399',
    description: 'Emergency reserve, civil capital sinking fund, debt liquidation.',
  },
];

const NEEDS_CATALOG: Array<[string, number, number]> = [
  ['Site Accommodation', 320, 720],
  ['Utilities — Electricity', 140, 280],
  ['Fuel & Vehicle Running', 180, 340],
  ['Cement & Aggregates', 240, 640],
  ['Site Consumables', 90, 210],
  ['Food & Household', 260, 420],
  ['Insurance Premium', 180, 180],
  ['Mobile & Data', 45, 75],
];

const WANTS_CATALOG: Array<[string, number, number]> = [
  ['Gym Membership', 55, 55],
  ['Running Shoes', 120, 260],
  ['Survey Instrument Upgrade', 180, 520],
  ['Dining & Social', 60, 190],
  ['Subscriptions & Software', 25, 70],
  ['Tactical Gear', 90, 280],
];

const SAVINGS_CATALOG: Array<[string, number, number]> = [
  ['Civil Capital Sinking Fund', 300, 420],
  ['Emergency Reserve Top-up', 150, 300],
  ['Vehicle Loan Extra Payment', 120, 220],
  ['Portfolio Contribution', 150, 260],
];

const INCOME_CATALOG: Array<[string, number]> = [
  ['Salary — Engineering Division', 4_150],
  ['Consultancy Retainer', 900],
  ['Survey Subcontract', 420],
];

export function createMockTransactions(days = 62): FinancialTransaction[] {
  const rand = seeded(77012);
  const today = isoDate();
  const out: FinancialTransaction[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i);
    const dayOfMonth = Number(date.slice(8, 10));
    const isPayDay = dayOfMonth === 1 || dayOfMonth === 16;

    if (isPayDay) {
      INCOME_CATALOG.forEach(([title, amount]) => {
        out.push({
          id: uid('tx'),
          date,
          amount,
          currency: 'USD',
          title,
          category: title.startsWith('Salary') ? 'Employment' : 'Consultancy',
          bucket: 'savings',
          type: 'income',
          linkedTaskId: null,
          status: 'settled',
          createdAt: new Date().toISOString(),
        });
      });
    }

    const spend = 2 + Math.floor(rand() * 4);
    for (let s = 0; s < spend; s += 1) {
      const pool = rand() > 0.42 ? NEEDS_CATALOG : rand() > 0.5 ? WANTS_CATALOG : SAVINGS_CATALOG;
      const [title, min, max] = pool[Math.floor(rand() * pool.length)];
      const bucket = NEEDS_CATALOG.some((c) => c[0] === title)
        ? 'needs'
        : WANTS_CATALOG.some((c) => c[0] === title)
          ? 'wants'
          : 'savings';
      const amount = Number((min + rand() * (max - min)).toFixed(2));
      out.push({
        id: uid('tx'),
        date,
        amount,
        currency: 'USD',
        title,
        category: title,
        bucket,
        type: 'expense',
        linkedTaskId: null,
        status: rand() > 0.88 ? 'pending' : 'settled',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Planned vs actual per category for the current month. */
export function buildCategoryVariance(transactions: FinancialTransaction[]): CategoryVariance[] {
  const today = isoDate();
  const month = today.slice(0, 7);
  const map = new Map<string, CategoryVariance>();

  for (const tx of transactions) {
    if (!tx.date.startsWith(month) || tx.type !== 'expense') continue;
    const current = map.get(tx.category) ?? {
      category: tx.category,
      planned: 0,
      actual: 0,
      bucket: tx.bucket,
    };
    current.actual += tx.amount;
    map.set(tx.category, current);
  }

  const plan = new Map<string, number>();
  NEEDS_CATALOG.concat(WANTS_CATALOG, SAVINGS_CATALOG).forEach(([title, min, max]) => {
    plan.set(title, Number(((min + max) / 2).toFixed(2)));
  });

  return Array.from(map.values())
    .map((v) => ({ ...v, planned: plan.get(v.category) ?? v.actual }))
    .sort((a, b) => b.actual - a.actual);
}

/** Seed transactions already linked to mind-map task nodes. */
export const LINKED_TASK_SEEDS: Array<{
  title: string;
  category: string;
  bucket: 'needs' | 'wants' | 'savings';
  amount: number;
  taskId: string;
}> = [
  { title: 'Non-shrink grout delivery', category: 'Cement & Aggregates', bucket: 'needs', amount: 1_980, taskId: 'dock.grout' },
  { title: 'Class 40 armour stone — 780 t', category: 'Site Consumables', bucket: 'needs', amount: 6_552, taskId: 'seawall.riprap' },
  { title: 'Barge charter — tide window 1', category: 'Site Consumables', bucket: 'needs', amount: 4_800, taskId: 'seawall.riprap' },
  { title: 'TMT steel — 16 mm', category: 'Site Consumables', bucket: 'needs', amount: 3_780, taskId: 'slab.procure' },
  { title: 'Anchor plate set (3 of 8)', category: 'Site Consumables', bucket: 'needs', amount: 3_630, taskId: 'dock.anchor' },
  { title: 'Engineering council submission fee', category: 'Insurance Premium', bucket: 'needs', amount: 450, taskId: 'slab.nhq' },
  { title: 'Gym membership — quarterly', category: 'Gym Membership', bucket: 'wants', amount: 165, taskId: 'health.push' },
  { title: 'Survey GNSS rover service', category: 'Survey Instrument Upgrade', bucket: 'wants', amount: 520, taskId: 'finance.lease' },
  { title: 'Sinking fund transfer — harbour package', category: 'Civil Capital Sinking Fund', bucket: 'savings', amount: 420, taskId: 'finance.sinking' },
];
