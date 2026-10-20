/**
 * Deterministic local reasoning — clinical, nutrition and training surfaces.
 * Mirrors the Gemini output contract exactly so the UI never has to branch.
 */

import { formatCurrency, round } from '@/lib/parser/utils';

export interface ClinicalContext {
  summary: string;
  flags: string[];
  biomarkers: Array<{ label: string; value: number; unit: string; status: string; refLow: number; refHigh: number }>;
}

export function localClinicalReview(ctx: ClinicalContext) {
  const directives = ctx.biomarkers
    .filter((b) => b.status === 'critical' || b.status === 'borderline')
    .map((b) => ({
      title: `${b.label} — ${b.status === 'critical' ? 'critical' : 'borderline'}`,
      detail:
        b.status === 'critical'
          ? `Measured ${b.value} ${b.unit} against reference ${b.refLow}–${b.refHigh}. Initiate a supervised corrective protocol and re-test in 8 weeks.`
          : `Measured ${b.value} ${b.unit} against reference ${b.refLow}–${b.refHigh}. Apply dietary and lifestyle correction, then re-test in 8 weeks.`,
      impact: b.status === 'critical' ? 3 : 2,
      severity: b.status === 'critical' ? ('high' as const) : ('medium' as const),
    }));

  return {
    summary: ctx.summary,
    directives,
    flags: ctx.flags,
  };
}

export interface MealPlanContext {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  slots: Array<'breakfast' | 'lunch' | 'snack' | 'dinner'>;
}

export function localMealPlan(ctx: MealPlanContext) {
  const ratio = { protein: 0.3, carbs: 0.42, fat: 0.28 };
  const plan = ctx.slots.map((slot, index) => {
    const share = index === ctx.slots.length - 1 ? 1 - ratio.protein - ratio.carbs - ratio.fat : ratio.protein;
    return {
      slot,
      name:
        slot === 'breakfast'
          ? 'Oats, whey isolate and berries'
          : slot === 'lunch'
            ? 'Grilled chicken, jasmine rice, mixed salad'
            : slot === 'snack'
              ? 'Greek yoghurt, almonds and a banana'
              : 'Salmon, red rice and roasted vegetables',
      protein: Math.round(ctx.protein * share),
      carbs: Math.round(ctx.carbs * share),
      fat: Math.round(ctx.fat * share),
      calories: Math.round(ctx.calories * share),
    };
  });
  return { plan, note: 'Macro split distributed 30/42/28 (protein/carbs/fat) across the training day.' };
}

export interface SubtaskContext {
  title: string;
  notes: string;
}

export function localSubtasks(ctx: SubtaskContext) {
  const base = [
    `Confirm scope and acceptance criteria for ${ctx.title}`,
    'Collect quantities, rates and site constraints',
    'Draft execution sequence with dependencies',
    'Secure approvals and material lead times',
    'Execute, verify and record completion evidence',
  ];
  return { subtasks: base };
}

export interface WorkoutContext {
  sessionTitle: string;
  sets: Array<{ exercise: string; reps: number; weightKg: number; rpe: number }>;
  readiness: number;
  proteinTarget: number;
  proteinIntake: number;
}

export function localWorkoutReview(ctx: WorkoutContext) {
  const topSet = ctx.sets.reduce(
    (best, s) => (s.weightKg * s.reps > best.weightKg * best.reps ? s : best),
    ctx.sets[0] ?? { exercise: '—', reps: 0, weightKg: 0, rpe: 0 },
  );
  const proteinGap = ctx.proteinTarget - ctx.proteinIntake;
  const directives = [
    {
      title: 'Top set captured',
      detail: `Best working set was ${topSet.exercise} at ${topSet.weightKg} kg × ${topSet.reps} (RPE ${topSet.rpe}). Estimated 1RM ${Math.round(topSet.weightKg * (1 + topSet.reps / 30))} kg using the Epley formula.`,
      impact: Math.round(topSet.weightKg * (1 + topSet.reps / 30)),
      severity: 'low' as const,
    },
    {
      title:
        proteinGap > 0
          ? `Close a ${proteinGap} g protein gap`
          : 'Protein target satisfied',
      detail:
        proteinGap > 0
          ? `You are ${proteinGap} g short of the ${ctx.proteinTarget} g target. Add a 40 g whey serving plus 250 g of curd or paneer to close the gap.`
          : `Protein intake of ${ctx.proteinIntake} g meets the ${ctx.proteinTarget} g target for the day.`,
      impact: Math.max(0, proteinGap),
      severity: proteinGap > 0 ? ('medium' as const) : ('low' as const),
    },
    {
      title:
        ctx.readiness >= 75
          ? 'Readiness supports progressive overload'
          : 'Deload recommendation',
      detail:
        ctx.readiness >= 75
          ? `Readiness ${ctx.readiness}/100 supports a 2.5–5 % load increase on the next exposure of the same movement pattern.`
          : `Readiness ${ctx.readiness}/100 suggests holding load at the current level for the next session and prioritising sleep.`,
      impact: ctx.readiness,
      severity: ctx.readiness >= 75 ? ('low' as const) : ('medium' as const),
    },
  ];
  return { summary: `Review of ${ctx.sessionTitle}`, directives };
}
