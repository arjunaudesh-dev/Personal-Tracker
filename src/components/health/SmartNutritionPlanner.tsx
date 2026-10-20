'use client';

import { Loader2, Sparkles, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { BiometricDay, MealEntry, WorkoutSession } from '@/lib/types/health';
import { computeMacroTargets } from '@/store/nexus-selectors';
import { formatNumber } from '@/lib/parser/utils';
import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/Progress';

interface MealPlanItem {
  slot: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

/** Dynamic TDEE & macro planner driven by wearable burn and training volume. */
export function SmartNutritionPlanner({
  biometrics,
  workouts,
  meals,
}: {
  biometrics: BiometricDay[];
  workouts: WorkoutSession[];
  meals: MealEntry[];
}) {
  const [plan, setPlan] = useState<MealPlanItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  const macros = useMemo(
    () => computeMacroTargets(biometrics, workouts),
    [biometrics, workouts],
  );

  const today = biometrics[biometrics.length - 1]?.date ?? new Date().toISOString().slice(0, 10);
  const todayMeals = meals.filter((m) => m.date === today);
  const intake = todayMeals.reduce(
    (acc, m) => ({
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      calories: acc.calories + m.calories,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 },
  );

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'meal-plan',
          payload: {
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            calories: macros.calories,
            slots: ['breakfast', 'lunch', 'snack', 'dinner'],
            locale: 'Sri Lanka',
          },
        }),
      });
      const json = await res.json();
      setPlan(json.data?.plan ?? []);
      setNote(json.data?.note ?? '');
    } finally {
      setLoading(false);
    }
  };

  const macroRows = [
    { label: 'Protein', value: intake.protein, target: macros.protein, tone: 'cyan' as const, unit: 'g' },
    { label: 'Carbs', value: intake.carbs, target: macros.carbs, tone: 'amber' as const, unit: 'g' },
    { label: 'Fat', value: intake.fat, target: macros.fat, tone: 'violet' as const, unit: 'g' },
  ];

  return (
    <GlassCard className="p-4" glow="emerald">
      <SectionHeader
        eyebrow="Dynamic targets"
        title="TDEE &amp; macro planner"
        action={
          <span className="chip border-nexus-emerald/30 bg-nexus-emerald/10 text-nexus-emerald">
            {formatNumber(macros.tdee)} kcal TDEE
          </span>
        }
      />

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'BMR', value: formatNumber(macros.bmr), unit: 'kcal' },
          { label: 'TDEE', value: formatNumber(macros.tdee), unit: 'kcal' },
          { label: 'Activity factor', value: macros.activityFactor.toFixed(2), unit: '×' },
          { label: 'Workout adj.', value: `+${macros.workoutAdjustment}`, unit: 'kcal' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-soft px-3 py-2">
            <p className="label-caps">{kpi.label}</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-100">
              {kpi.value} <span className="text-[9px] text-slate-500">{kpi.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2.5">
        {macroRows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-[10.5px]">
              <span className="text-slate-400">
                {row.label} <span className="text-slate-600">({row.target} {row.unit})</span>
              </span>
              <span className="font-mono text-slate-300">
                {row.value} / {row.target} {row.unit}
              </span>
            </div>
            <ProgressBar
              value={row.target > 0 ? (row.value / row.target) * 100 : 0}
              tone={row.value >= row.target ? 'emerald' : row.tone}
              height={5}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-white/[0.07] pt-3">
        <div className="flex items-center justify-between">
          <p className="label-caps">Logged meals ({todayMeals.length})</p>
          <button onClick={generate} disabled={loading} className="btn btn-violet h-7 px-2.5 text-[10px]">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            AI plan
          </button>
        </div>

        <ul className="mt-2 space-y-1">
          {todayMeals.map((meal) => (
            <li
              key={meal.id}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
            >
              <Utensils className="h-3.5 w-3.5 shrink-0 text-nexus-emerald" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] text-slate-200">{meal.name}</p>
                <p className="font-mono text-[9px] text-slate-600">
                  {meal.slot} · P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{meal.calories} kcal</span>
            </li>
          ))}
          {todayMeals.length === 0 ? (
            <li className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-slate-600">
              No meals logged today — use the quick capture bar on the briefing screen.
            </li>
          ) : null}
        </ul>

        {plan?.length ? (
          <div className="mt-3 rounded-xl border border-nexus-violet/25 bg-nexus-violet/[0.07] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-nexus-violet">
              AI meal plan
            </p>
            <ul className="mt-1.5 space-y-1">
              {plan.map((item) => (
                <li key={item.slot} className="text-[10.5px] text-slate-300">
                  <span className="capitalize text-nexus-violet">{item.slot}</span> — {item.name}{' '}
                  <span className="font-mono text-slate-500">
                    ({item.protein}P / {item.carbs}C / {item.fat}F · {item.calories} kcal)
                  </span>
                </li>
              ))}
            </ul>
            {note ? <p className="mt-2 text-[10px] text-slate-500">{note}</p> : null}
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
