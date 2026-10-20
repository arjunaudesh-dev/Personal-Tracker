import type {
  BiometricDay,
  CashflowPoint,
  DailyOutflow,
  FinancialTransaction,
  MacroTargets,
  MindMapTaskNode,
  WorkoutSession,
} from '@/lib/types/nexus';

import { OPERATOR_PROFILE } from '@/lib/config/profile';
import { addDays, isoDate, startOfWeek } from '@/lib/parser/utils';
import { countBottlenecks } from '@/components/mindmap/progress-rollup';

export interface BudgetBreakdown {
  bucket: 'needs' | 'wants' | 'savings';
  actual: number;
  planned: number;
  ratio: number;
  color: string;
}

export function monthKey(date = isoDate()) {
  return date.slice(0, 7);
}

export function monthTransactions(transactions: FinancialTransaction[], month = monthKey()) {
  return transactions.filter((tx) => tx.date.startsWith(month));
}

export function monthlyIncome(transactions: FinancialTransaction[], month = monthKey()) {
  return monthTransactions(transactions, month)
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
}

export function monthlyExpense(transactions: FinancialTransaction[], month = monthKey()) {
  return monthTransactions(transactions, month)
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
}

export function budgetBreakdown(transactions: FinancialTransaction[]): BudgetBreakdown[] {
  const income = monthlyIncome(transactions);
  const spend = monthTransactions(transactions).filter((t) => t.type === 'expense');
  const colors: Record<string, string> = { needs: '#22d3ee', wants: '#a78bfa', savings: '#34d399' };
  const ratios: Record<string, number> = { needs: 0.5, wants: 0.3, savings: 0.2 };

  return (['needs', 'wants', 'savings'] as const).map((bucket) => ({
    bucket,
    actual: spend.filter((t) => t.bucket === bucket).reduce((acc, t) => acc + t.amount, 0),
    planned: income * ratios[bucket],
    ratio: ratios[bucket] * 100,
    color: colors[bucket],
  }));
}

/** Weekly cashflow waterfall series across the trailing 8 weeks. */
export function cashflowSeries(transactions: FinancialTransaction[]): CashflowPoint[] {
  const today = isoDate();
  const weeks: CashflowPoint[] = [];
  let balance = 0;

  for (let i = 7; i >= 0; i -= 1) {
    const end = addDays(today, -i * 7);
    const start = addDays(end, -6);
    const slice = transactions.filter((tx) => tx.date >= start && tx.date <= end);
    const inflow = slice.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const outflow = slice.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const net = inflow - outflow;
    balance += net;
    weeks.push({
      period: start.slice(5),
      inflow,
      outflow,
      net,
      balance,
    });
  }

  return weeks;
}

/** Trailing 7-day outflow velocity. */
export function dailyOutflow(transactions: FinancialTransaction[], days = 7): DailyOutflow[] {
  const today = isoDate();
  const out: DailyOutflow[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i);
    const amount = transactions
      .filter((tx) => tx.date === date && tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);
    out.push({ day: date.slice(5), amount });
  }
  return out;
}

/** Average daily burn across the trailing 30 days. */
export function burnRate(transactions: FinancialTransaction[]) {
  const today = isoDate();
  const start = addDays(today, -30);
  const total = transactions
    .filter((tx) => tx.date >= start && tx.date <= '9999' && tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);
  return total / 30;
}

/** Committed capital from mind-map task cashflow. */
export function committedCapital(tasks: MindMapTaskNode[]) {
  return tasks.reduce((acc, t) => acc + (t.cashflow?.committed ?? 0), 0);
}

export function actualSpend(tasks: MindMapTaskNode[]) {
  return tasks.reduce((acc, t) => acc + (t.cashflow?.actualSpend ?? 0), 0);
}

/** Mifflin-St Jeor resting metabolic rate. */
export function restingMetabolicRate(weightKg: number, heightCm: number, age: number) {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

/** Dynamic TDEE with wearable burn and training volume adjustments. */
export function computeMacroTargets(
  biometrics: BiometricDay[],
  workouts: WorkoutSession[],
  activityFactor = OPERATOR_PROFILE.activityFactor,
): MacroTargets {
  const latest = biometrics[biometrics.length - 1];
  const weight = latest?.weightKg ?? OPERATOR_PROFILE.weightKg;
  const bmr = Math.round(restingMetabolicRate(weight, OPERATOR_PROFILE.heightCm, OPERATOR_PROFILE.age));

  const recentWorkouts = workouts.filter((w) => {
    const cutoff = addDays(isoDate(), -7);
    return w.date >= cutoff;
  });
  const workoutAdjustment = recentWorkouts.reduce((acc, w) => acc + Math.round(w.calories * 0.35), 0);
  const tdee = Math.round(bmr * activityFactor) + workoutAdjustment;

  const protein = Math.round(OPERATOR_PROFILE.proteinPerKg * weight);
  const remaining = tdee - protein * 4;
  const fat = Math.round((remaining * 0.27) / 9);
  const carbs = Math.max(0, Math.round((remaining - fat * 9) / 4));

  return {
    calories: tdee,
    protein,
    carbs,
    fat,
    bmr,
    tdee,
    activityFactor,
    workoutAdjustment,
  };
}

/** Readiness score (0–100) blending sleep, resting HR trend, steps and hydration. */
export function computeReadiness(biometrics: BiometricDay[]) {
  const latest = biometrics[biometrics.length - 1];
  if (!latest) return 0;
  const prev = biometrics[biometrics.length - 8];
  const sleepScore = Math.min(100, (latest.sleepMinutes / OPERATOR_PROFILE.sleepTargetMin) * 100);
  const hrDelta = prev ? latest.restingHr - prev.restingHr : 0;
  const hrScore = Math.max(0, Math.min(100, 80 - hrDelta * 8));
  const stepScore = Math.min(100, (latest.steps / OPERATOR_PROFILE.stepTarget) * 100);
  const hydrationScore = Math.min(100, (latest.hydrationMl / OPERATOR_PROFILE.hydrationTargetMl) * 100);
  return Math.round(sleepScore * 0.35 + hrScore * 0.2 + stepScore * 0.25 + hydrationScore * 0.2);
}

/** Seven day sleep vs resting-HR series for sparklines. */
export function telemetrySeries(biometrics: BiometricDay[], days = 7) {
  return biometrics.slice(-days).map((b) => ({
    day: b.date.slice(5),
    sleep: b.sleepScore,
    restingHr: b.restingHr,
    steps: b.steps,
    calories: b.caloriesBurned,
    hydration: b.hydrationMl,
  }));
}

export function openBottlenecks(tasks: MindMapTaskNode[]) {
  return countBottlenecks(tasks, isoDate());
}

export function weekStart(date = isoDate()) {
  return startOfWeek(date);
}
